"""Sanity tests for the lab scripts (local simulators only; never touches IBM hardware).

Run:  python test_labs.py        (after: pip install -r requirements.txt)
"""
import importlib.util
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", category=DeprecationWarning)
HERE = Path(__file__).parent


def load(name: str):
    spec = importlib.util.spec_from_file_location(name.replace(".py", "").replace("0", "lab", 1), HERE / name)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_first_circuit():
    from qiskit.primitives import StatevectorSampler

    lab = load("01_first_circuit.py")
    counts = StatevectorSampler().run([lab.bell_circuit()], shots=2000).result()[0].data.meas.get_counts()
    assert set(counts) <= {"00", "11"}, counts          # ideal Bell state never gives 01 / 10
    assert all(abs(n / 2000 - 0.5) < 0.06 for n in counts.values()), counts


def test_chsh():
    lab = load("02_chsh_bell_test.py")
    settings = list(lab.SIGNS)
    E = lab.run(settings, None, 8000)
    S = sum(lab.SIGNS[k] * E[k] for k in settings)
    assert 2.6 < S <= 2.9, S                              # ideal quantum value is 2*sqrt(2) ~ 2.83


def test_grover_every_marked_item():
    lab = load("03_grover_cirq.py")
    for marked in ("00", "01", "10", "11"):
        assert lab.search(marked, shots=200) == {marked: 200}, marked


def test_vqe_matches_exact():
    import numpy as np
    import pennylane as qml

    lab = load("04_vqe_pennylane.py")
    _, e_vqe, _ = lab.train()
    e_exact = float(np.linalg.eigvalsh(qml.matrix(lab.H, wire_order=[0, 1]))[0])
    assert abs(e_vqe - e_exact) < 1e-3, (e_vqe, e_exact)


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
