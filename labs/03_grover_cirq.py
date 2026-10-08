"""Lab 3 - Grover's search on 2 qubits (Cirq, local simulator).

Searches 4 items for one marked bitstring. With N=4 a single Grover iteration finds it with certainty.
"""
import sys

import cirq


def grover_circuit(marked: str) -> cirq.Circuit:
    q = cirq.LineQubit.range(2)
    flip = [cirq.X(q[i]) for i, bit in enumerate(marked) if bit == "0"]
    c = cirq.Circuit(cirq.H.on_each(*q))                      # uniform superposition over 4 items
    c += [*flip, cirq.CZ(q[0], q[1]), *flip]                  # oracle: flips the sign of |marked>
    c += [cirq.H.on_each(*q), cirq.X.on_each(*q),             # diffusion: reflect about the average
          cirq.CZ(q[0], q[1]), cirq.X.on_each(*q), cirq.H.on_each(*q)]
    c.append(cirq.measure(*q, key="result"))
    return c


def search(marked: str, shots: int = 1000) -> dict:
    result = cirq.Simulator().run(grover_circuit(marked), repetitions=shots)
    counts = result.histogram(key="result")          # keys are integers: 3 means "11"
    return {format(k, "02b"): v for k, v in sorted(counts.items())}


if __name__ == "__main__":
    marked = sys.argv[1] if len(sys.argv) > 1 else "11"
    print(grover_circuit(marked))
    print(f"\nMarked item: {marked}")
    print("Measured    :", search(marked))
    print("A classical search needs ~2.5 guesses on average for 4 items; Grover needs 1 oracle call.")
