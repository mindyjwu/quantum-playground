"""Lab 1 - Run your first circuit.

By default this runs on a local *simulated noisy IBM chip* (no account needed).
Add --hardware to run the exact same code on a real IBM quantum computer.
"""
import argparse

from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import SamplerV2


def bell_circuit() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    qc.h(0)          # put qubit 0 in superposition
    qc.cx(0, 1)      # entangle qubit 1 with qubit 0
    qc.measure_all()  # measure both; results land in the register "meas"
    return qc


def get_backend(hardware: bool):
    if hardware:
        from qiskit_ibm_runtime import QiskitRuntimeService

        service = QiskitRuntimeService()  # loads the account you saved earlier
        return service.least_busy(operational=True, simulator=False, min_num_qubits=2)
    from qiskit_ibm_runtime.fake_provider import FakeSherbrooke

    return FakeSherbrooke()  # local noise model of a real IBM device


def show(title: str, counts: dict) -> None:
    shots = sum(counts.values())
    print(title)
    for bits, n in sorted(counts.items()):
        print(f"  {bits}: {n:5d}  ({n / shots:6.1%})")
    good = counts.get("00", 0) + counts.get("11", 0)
    print(f"  -> correlated outcomes (00 or 11): {good / shots:.1%}\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--hardware", action="store_true", help="run on a real IBM quantum computer")
    ap.add_argument("--shots", type=int, default=1000)
    args = ap.parse_args()

    qc = bell_circuit()
    print(qc.draw(output="text"))

    # 1) Ideal, noise-free result: what the math predicts.
    ideal = StatevectorSampler().run([qc], shots=args.shots).result()[0]
    show("Ideal simulator:", ideal.data.meas.get_counts())

    # 2) Noisy device (simulated locally, or real with --hardware).
    backend = get_backend(args.hardware)
    print(f"Backend: {backend.name}\n")
    # Real chips only understand their own native gates and qubit layout; transpile to that.
    isa_circuit = generate_preset_pass_manager(optimization_level=1, backend=backend).run(qc)
    job = SamplerV2(mode=backend).run([isa_circuit], shots=args.shots)
    if args.hardware:
        print(f"Job submitted: {job.job_id()}  (watch it on the Workloads page)")
    result = job.result()[0]
    show("Device result:", result.data.meas.get_counts())


if __name__ == "__main__":
    main()
