"""Lab 4 - A tiny variational quantum eigensolver (PennyLane, local simulator).

Finds the lowest energy of H = Z0 Z1 + 0.5 X0 + 0.5 X1 by tuning circuit parameters
with a classical optimizer, then checks the answer against exact diagonalization.
"""
import numpy as np
import pennylane as qml
from pennylane import numpy as pnp

H = qml.Z(0) @ qml.Z(1) + 0.5 * qml.X(0) + 0.5 * qml.X(1)
dev = qml.device("default.qubit", wires=2)


@qml.qnode(dev)
def energy(params):
    qml.RY(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    qml.RY(params[2], wires=0)
    qml.RY(params[3], wires=1)
    return qml.expval(H)


def train(steps: int = 150, seed: int = 0):
    rng = np.random.default_rng(seed)
    params = pnp.array(rng.uniform(0, np.pi, 4), requires_grad=True)
    opt = qml.AdamOptimizer(stepsize=0.1)
    history = []
    for _ in range(steps):
        params, e = opt.step_and_cost(energy, params)
        history.append(float(e))
    return params, float(energy(params)), history


if __name__ == "__main__":
    params, e_vqe, history = train()
    e_exact = float(np.linalg.eigvalsh(qml.matrix(H, wire_order=[0, 1]))[0])
    for i in (0, 10, 25, 50, 100, len(history) - 1):
        print(f"step {i:3d}  energy = {history[i]: .6f}")
    print(f"\nVQE energy   : {e_vqe: .6f}")
    print(f"Exact energy : {e_exact: .6f}   (a classical computer solves this 4x4 problem instantly)")
    print(f"Error        : {abs(e_vqe - e_exact):.2e}")
