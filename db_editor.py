import json, sys, tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path

if getattr(sys, "frozen", False):
    SCRIPT_DIR = Path(sys.executable).parent
else:
    SCRIPT_DIR = Path(__file__).parent

DATA_DIR      = SCRIPT_DIR / "data"
AIRCRAFT_FILE = DATA_DIR / "aircraft.js"
AIRPORTS_FILE = DATA_DIR / "airports.js"

def load_js_array(path):
    raw   = path.read_text(encoding="utf-8")
    start = raw.index("[")
    end   = raw.rindex("]") + 1
    return json.loads(raw[start:end])

def save_js_array(path, data):
    raw    = path.read_text(encoding="utf-8")
    start  = raw.index("[")
    end    = raw.rindex("]") + 1
    header = raw[:start]
    footer = raw[end:]
    path.write_text(header + json.dumps(data, indent=2, ensure_ascii=False) + footer,
                    encoding="utf-8")

AIRCRAFT_FIELDS = [
    ("id",               "ID",               "str",   None),
    ("name",             "Name",             "str",   None),
    ("manufacturer",     "Manufacturer",     "str",   None),
    ("type",             "Type",             "enum",  ["Short-Haul","Medium-Haul","Long-Haul"]),
    ("category",         "Category (1-10)",  "int",   None),
    ("seats",            "Seats",            "int",   None),
    ("payload_ton",      "Payload (ton)",    "float", None),
    ("range_km",         "Range (km)",       "int",   None),
    ("speed_kmh",        "Speed (km/h)",     "int",   None),
    ("price",            "Price ($)",        "int",   None),
    ("fuel_consumption", "Fuel Consumption", "str",   None),
    ("wear_rate",        "Wear Rate",        "str",   None),
    ("rd_unlock",        "R&D Unlock",       "enum",  ["","Yes"]),
]

AIRPORT_FIELDS = [
    ("iata",       "IATA Code",   "str",   None),
    ("name",       "Name",        "str",   None),
    ("city",       "City",        "str",   None),
    ("country",    "Country",     "str",   None),
    ("lat",        "Latitude",    "float", None),
    ("lon",        "Longitude",   "float", None),
    ("cat",        "Category",    "int",   None),
    ("flightTax",  "Flight Tax",  "int",   None),
    ("grossPrice", "Gross Price", "int",   None),
    ("economy",    "Economy",     "float", None),
    ("business",   "Business",    "float", None),
    ("first",      "First",       "float", None),
    ("cargo",      "Cargo",       "float", None),
]

AIRCRAFT_COLS = ["id","name","manufacturer","type","category","seats","range_km","speed_kmh","price","rd_unlock"]
AIRPORT_COLS  = ["iata","name","city","country","cat","flightTax","grossPrice","economy","business","first","cargo"]

C = dict(
    dark="#1e2330", mid="#252b3b", panel="#1a1f2e", accent="#3b82f6",
    text="#e2e8f0", muted="#94a3b8", sel="#2d4a7a", alt="#222840",
    hdr="#0f172a", green="#16a34a", red="#dc2626", blue="#2563eb", purple="#7c3aed",
)
COL_W = {
    "id":150,"name":185,"manufacturer":120,"type":105,"category":70,"cat":60,
    "seats":60,"payload_ton":88,"range_km":85,"speed_kmh":88,"price":108,
    "fuel_consumption":120,"wear_rate":80,"rd_unlock":80,"iata":60,"city":125,
    "country":125,"lat":75,"lon":75,"flightTax":85,"grossPrice":105,
    "economy":72,"business":72,"first":60,"cargo":60,
}

class RecordDialog(tk.Toplevel):
    def __init__(self, parent, title, fields, record=None):
        super().__init__(parent)
        self.title(title)
        self.resizable(False, False)
        self.grab_set()
        self.configure(bg=C["mid"])
        self.result = None
        self._fields = fields
        self._vars   = {}
        frame = tk.Frame(self, bg=C["mid"], padx=16, pady=12)
        frame.pack(fill="both", expand=True)
        for row, (key, label, ftype, opts) in enumerate(fields):
            tk.Label(frame, text=label+":", bg=C["mid"], fg=C["muted"],
                     font=("Segoe UI",9), anchor="e", width=18).grid(
                row=row, column=0, sticky="e", padx=(0,8), pady=3)
            val = record.get(key, "") if record else ""
            if ftype == "enum":
                var = tk.StringVar(value=str(val))
                ttk.Combobox(frame, textvariable=var, values=opts,
                             state="readonly", width=28).grid(row=row, column=1, sticky="ew", pady=3)
            else:
                var = tk.StringVar(value=str(val))
                tk.Entry(frame, textvariable=var, width=30,
                         bg=C["dark"], fg=C["text"], insertbackground=C["text"],
                         relief="flat", font=("Segoe UI",10)).grid(
                    row=row, column=1, sticky="ew", pady=3, ipady=4)
            self._vars[key] = var
        bf = tk.Frame(frame, bg=C["mid"])
        bf.grid(row=len(fields), column=0, columnspan=2, pady=(14,0))
        tk.Button(bf, text="  Save  ", command=self._save, bg=C["green"],
                  fg="white", relief="flat", font=("Segoe UI",9,"bold"),
                  padx=8, pady=4, cursor="hand2").pack(side="left", padx=4)
        tk.Button(bf, text=" Cancel ", command=self.destroy, bg="#475569",
                  fg="white", relief="flat", font=("Segoe UI",9,"bold"),
                  padx=8, pady=4, cursor="hand2").pack(side="left", padx=4)
        self.transient(parent)
        self.wait_window()

    def _save(self):
        result = {}
        for key, label, ftype, _ in self._fields:
            raw = self._vars[key].get().strip()
            try:
                if   ftype == "int":   result[key] = int(raw)   if raw else 0
                elif ftype == "float": result[key] = float(raw) if raw else 0.0
                else:                  result[key] = raw
            except ValueError:
                messagebox.showerror("Validation", f"'{label}' expects {ftype}, got: {raw!r}", parent=self)
                return
        self.result = result
        self.destroy()


class DbTab(ttk.Frame):
    def __init__(self, parent, path, fields, columns, pk):
        super().__init__(parent)
        self._path=path; self._fields=fields; self._columns=columns; self._pk=pk
        self._data=[]; self._filtered=[]; self._sort_col=None; self._sort_asc=True; self._dirty=False
        self._build_ui()
        self._load()

    def _build_ui(self):
        self.columnconfigure(0, weight=1)
        self.rowconfigure(1, weight=1)
        top = tk.Frame(self, bg=C["panel"], padx=10, pady=8)
        top.grid(row=0, column=0, sticky="ew")
        top.columnconfigure(1, weight=1)
        tk.Label(top, text="Search:", bg=C["panel"], fg=C["muted"],
                 font=("Segoe UI",9)).grid(row=0, column=0, padx=(0,6))
        self._q = tk.StringVar()
        self._q.trace_add("write", lambda *_: self._apply_filter())
        tk.Entry(top, textvariable=self._q, bg=C["mid"], fg=C["text"],
                 insertbackground=C["text"], relief="flat",
                 font=("Segoe UI",10), width=28).grid(row=0, column=1, sticky="w", ipady=4, padx=(0,12))
        self._cnt = tk.Label(top, text="", bg=C["panel"], fg=C["muted"], font=("Segoe UI",9,"italic"))
        self._cnt.grid(row=0, column=2, padx=8)
        bf = tk.Frame(top, bg=C["panel"])
        bf.grid(row=0, column=3, sticky="e")
        def btn(t, cmd, bg):
            b = tk.Button(bf, text=t, command=cmd, bg=bg, fg="white",
                          activebackground=bg, relief="flat", font=("Segoe UI",9,"bold"),
                          padx=10, pady=4, cursor="hand2", bd=0)
            b.pack(side="left", padx=3)
            return b
        btn("+ New",     self._new,    C["green"])
        btn("  Edit",   self._edit,   C["blue"])
        btn("  Delete", self._delete, C["red"])
        self._save_btn = btn("  Save", self._save_file, C["purple"])
        tf = tk.Frame(self, bg=C["dark"])
        tf.grid(row=1, column=0, sticky="nsew", padx=6, pady=(0,6))
        tf.rowconfigure(0, weight=1)
        tf.columnconfigure(0, weight=1)
        s = ttk.Style()
        s.theme_use("clam")
        s.configure("Treeview", background=C["mid"], foreground=C["text"],
                    fieldbackground=C["mid"], rowheight=26, font=("Segoe UI",9))
        s.configure("Treeview.Heading", background=C["panel"], foreground=C["accent"],
                    font=("Segoe UI",9,"bold"), relief="flat")
        s.map("Treeview", background=[("selected",C["sel"])], foreground=[("selected","white")])
        self._tree = ttk.Treeview(tf, columns=self._columns, show="headings", selectmode="browse")
        for col in self._columns:
            lbl = next((f[1] for f in self._fields if f[0]==col), col)
            self._tree.heading(col, text=lbl, command=lambda c=col: self._sort(c))
            self._tree.column(col, width=COL_W.get(col,100), stretch=False, anchor="w")
        self._tree.tag_configure("alt", background=C["alt"])
        vsb = ttk.Scrollbar(tf, orient="vertical",   command=self._tree.yview)
        hsb = ttk.Scrollbar(tf, orient="horizontal", command=self._tree.xview)
        self._tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        self._tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")
        self._tree.bind("<Double-1>", lambda e: self._edit())

    def _load(self):
        if not self._path.exists():
            messagebox.showerror("Not Found", f"File not found:\n{self._path}"); return
        self._data=load_js_array(self._path); self._filtered=self._data[:]; self._refresh()

    def _apply_filter(self):
        q=self._q.get().lower()
        self._filtered=([r for r in self._data if any(q in str(v).lower() for v in r.values())]
                        if q else self._data[:])
        if self._sort_col:
            self._filtered.sort(key=lambda r:str(r.get(self._sort_col,"")).lower(), reverse=not self._sort_asc)
        self._refresh()

    def _sort(self, col):
        self._sort_asc=(not self._sort_asc) if self._sort_col==col else True
        self._sort_col=col; self._apply_filter()

    def _refresh(self):
        self._tree.delete(*self._tree.get_children())
        for i,rec in enumerate(self._filtered):
            self._tree.insert("","end",iid=str(i),values=[rec.get(c,"") for c in self._columns],
                               tags=("alt",) if i%2 else ())
        n,t=len(self._filtered),len(self._data)
        self._cnt.config(text=f"{n} of {t} shown" if n!=t else f"{t} entries")

    def _sel(self):
        sel=self._tree.selection()
        if not sel: return None,None
        rec=self._filtered[int(sel[0])]
        idx=next((i for i,r in enumerate(self._data) if r[self._pk]==rec[self._pk]),None)
        return rec,idx

    def _new(self):
        dlg=RecordDialog(self,"New Entry",self._fields)
        if not dlg.result: return
        pk=dlg.result[self._pk]
        if any(r[self._pk]==pk for r in self._data):
            messagebox.showerror("Duplicate",f"{self._pk}='{pk}' already exists."); return
        self._data.append(dlg.result); self._mark_dirty()

    def _edit(self):
        rec,idx=self._sel()
        if rec is None: messagebox.showinfo("No Selection","Select an entry to edit."); return
        dlg=RecordDialog(self,"Edit Entry",self._fields,record=rec)
        if not dlg.result: return
        npk=dlg.result[self._pk]
        if next((r for i,r in enumerate(self._data) if r[self._pk]==npk and i!=idx),None):
            messagebox.showerror("Duplicate",f"{self._pk}='{npk}' already exists."); return
        self._data[idx]=dlg.result; self._mark_dirty()

    def _delete(self):
        rec,idx=self._sel()
        if rec is None: messagebox.showinfo("No Selection","Select an entry to delete."); return
        if messagebox.askyesno("Confirm Delete",f"Delete '{rec[self._pk]}'?\n\nThis cannot be undone."):
            self._data.pop(idx); self._mark_dirty()

    def _mark_dirty(self):
        self._dirty=True; self._apply_filter()
        self._save_btn.config(text="  Save  *", bg="#9333ea")

    def _save_file(self):
        try:
            save_js_array(self._path,self._data)
            self._dirty=False
            self._save_btn.config(text="  Save", bg=C["purple"])
            messagebox.showinfo("Saved",f"Saved {len(self._data)} entries to:\n{self._path}")
        except Exception as e:
            messagebox.showerror("Save Failed",str(e))

    @property
    def dirty(self): return self._dirty


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AMT Database Editor")
        self.geometry("1220x700")
        self.configure(bg=C["dark"])
        self.minsize(900,500)
        hdr=tk.Frame(self,bg=C["hdr"],pady=8)
        hdr.pack(fill="x")
        tk.Label(hdr,text="  Airlines Manager Tycoon  -  Database Editor",
                 bg=C["hdr"],fg=C["accent"],font=("Segoe UI",13,"bold")).pack(side="left",padx=16)
        tk.Label(hdr,text=str(DATA_DIR),bg=C["hdr"],fg=C["muted"],font=("Segoe UI",8)).pack(side="right",padx=16)
        nb=ttk.Notebook(self)
        nb.pack(fill="both",expand=True,padx=6,pady=(4,6))
        s=ttk.Style()
        s.configure("TNotebook",background=C["dark"],borderwidth=0)
        s.configure("TNotebook.Tab",background=C["panel"],foreground=C["muted"],
                    font=("Segoe UI",10,"bold"),padding=[14,6])
        s.map("TNotebook.Tab",background=[("selected",C["dark"])],foreground=[("selected",C["accent"])])
        self._ac =DbTab(nb,AIRCRAFT_FILE,AIRCRAFT_FIELDS,AIRCRAFT_COLS,"id")
        self._apt=DbTab(nb,AIRPORTS_FILE,AIRPORT_FIELDS, AIRPORT_COLS, "iata")
        nb.add(self._ac, text="  Aircraft")
        nb.add(self._apt,text="  Airports")
        self.protocol("WM_DELETE_WINDOW",self._on_close)

    def _on_close(self):
        if self._ac.dirty or self._apt.dirty:
            if not messagebox.askyesno("Unsaved Changes","You have unsaved changes.\nExit anyway?"): return
        self.destroy()

if __name__=="__main__":
    App().mainloop()
