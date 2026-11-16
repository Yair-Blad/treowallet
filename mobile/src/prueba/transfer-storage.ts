
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

import { TransferRequest } from "./api";

const PENDING_TRANSFER_KEY = "treowallet_pending_transfer";

export interface PendingTransfer {
  idempotencyKey: string;
  transfer: TransferRequest;
}

/**
 * Recupera la transferencia pendiente, si existe.
 */
export async function getPendingTransfer(): Promise<PendingTransfer | null> {
  const storedTransfer = await SecureStore.getItemAsync(
    PENDING_TRANSFER_KEY
  );

  if (!storedTransfer) {
    return null;
  }

  try {
    const pendingTransfer: PendingTransfer = JSON.parse(storedTransfer);

    if (
      !pendingTransfer.idempotencyKey ||
      !pendingTransfer.transfer?.beneficiary_id ||
      !pendingTransfer.transfer?.account_id ||
      !pendingTransfer.transfer?.amount
    ) {
      throw new Error("Los datos de la transferencia pendiente no son válidos.");
    }

    return pendingTransfer;
  } catch {
    throw new Error(
      "No fue posible recuperar la transferencia pendiente. No se ha eliminado su información."
    );
  }
}

/**
 * Guarda una nueva transferencia pendiente.
 * Genera una clave UUID única para identificar la operación.
 */
export async function savePendingTransfer(
  transfer: TransferRequest
): Promise<PendingTransfer> {
  const existingTransfer = await getPendingTransfer();

  if (existingTransfer) {
    throw new Error(
      "Ya existe una transferencia pendiente. Debes resolverla antes de iniciar otra."
    );
  }

  const pendingTransfer: PendingTransfer = {
    idempotencyKey: Crypto.randomUUID(),
    transfer: {
      beneficiary_id: transfer.beneficiary_id,
      account_id: transfer.account_id,
      amount: transfer.amount,
    },
  };

  await SecureStore.setItemAsync(
    PENDING_TRANSFER_KEY,
    JSON.stringify(pendingTransfer)
  );

  return pendingTransfer;
}

/**
 * Elimina la transferencia pendiente únicamente cuando
 * el backend confirma que la operación fue exitosa.
 */
export async function clearPendingTransfer(): Promise<void> {
  await SecureStore.deleteItemAsync(PENDING_TRANSFER_KEY);
}
