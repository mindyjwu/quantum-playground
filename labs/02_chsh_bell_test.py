"""Lab 2 - Test a Bell (CHSH) inequality.

Any local-hidden-variable ("sealed envelope") model must give S <= 2.
Quantum mechanics predicts up to 2*sqrt(2) ~ 2.83 for an entangled pair.
Runs locally by default; add --hardware for a real IBM device.
"""
import argparse
from math import pi, sqrt

from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import SamplerV2

# Alice measures Z or X. Bob measures along an axis 45 degrees between them.
ALICE = {"A0": 0.0, "A1": pi / 2}          # angle of measurement axis in the Z-X plane
BOB = {"B0": pi / 4, "B1": -pi / 4}
SIGNS = {("A0", "B0"): +1, ("A0", "B1"): +1, ("A1", "B0"): +1, ("A1", "B1"): -1}


def circuit(a_angle: float, b_angle: float) -> QuantumCircuit:
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)                # Bell pair (|00> + |11>)/sqrt(2)
    qc.ry(-a_angle, 0)         # rotate each qubit's chosen axis onto Z...
    qc.ry(-b_angle, 1)
    qc.measure_all()           # ...then measure in Z
    return qc


def correlator(counts: dict) -> float:
    """E = P(same) - P(different) for the two measured bits."""
    shots = sum(counts.values())
    same = sum(n for bits, n in counts.items() if bits[0] == bits[1])
    return (2 * same - shots) / shots


def run(settings, backend, shots):
    circuits = [circuit(ALICE[a], BOB[b]) for a, b in settings]
    if backend is None:
        res = StatevectorSampler().run(circuits, shots=shots).result()
    else:
        pm = generate_preset_pass_manager(optimization_level=1, backend=backend)
        res = SamplerV2(mode=backend).run([pm.run(c) for c in circuits], shots=shots).result()
    return {s: correlator(r.data.meas.get_counts()) for s, r in zip(settings, res)}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--hardware", action="store_true")
    ap.add_argument("--shots", type=int, default=4000)
    args = ap.parse_args()

    settings = list(SIGNS)
    backends = [("ideal simulator", None)]
    if args.hardware:
        from qiskit_ibm_runtime import QiskitRuntimeService

        backends.append(("real hardware", QiskitRuntimeService().least_busy(operational=True, simulator=False, min_num_qubits=2)))
    else:
        from qiskit_ibm_runtime.fake_provider import FakeSherbrooke

        backends.append(("noisy simulated chip", FakeSherbrooke()))

    for label, backend in backends:
        E = run(settings, backend, args.shots)
        S = sum(SIGNS[k] * E[k] for k in settings)
        verdict = "VIOLATES the classical bound of 2" if S > 2 else "does not beat the classical bound"
        print(f"{label:22s} S = {S:.3f}   ({verdict})")
    print(f"\nClassical limit: 2.000   Quantum maximum: {2 * sqrt(2):.3f}")


if __name__ == "__main__":
    main()
