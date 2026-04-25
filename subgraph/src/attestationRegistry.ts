import {
  AttestationCreated,
  AttestationRevoked
} from '../generated/AttestationRegistry/AttestationRegistry'
import { Attestation, Model, ProtocolStats } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load('0')
  if (!stats) {
    stats = new ProtocolStats('0')
    stats.totalModels = BigInt.zero()
    stats.totalAttestations = BigInt.zero()
    stats.activeModels = BigInt.zero()
    stats.revokedAttestations = BigInt.zero()
    stats.save()
  }
  return stats
}

export function handleAttestationCreated(event: AttestationCreated): void {
  let attestation = new Attestation(event.params.id.toHex())
  attestation.attestationId = event.params.id
  attestation.model = event.params.modelId.toHex()
  attestation.inputHash = event.params.inputHash
  attestation.outputHash = event.params.outputHash
  attestation.attester = event.params.attester
  attestation.deadline = event.params.deadline
  attestation.timestamp = event.block.timestamp
  attestation.isRevoked = false
  attestation.metadataURI = event.params.metadataURI
  attestation.save()

  let model = Model.load(event.params.modelId.toHex())
  if (model) {
    model.attestationsCount = model.attestationsCount.plus(BigInt.fromI32(1))
    model.save()
  }

  let stats = getOrCreateProtocolStats()
  stats.totalAttestations = stats.totalAttestations.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleAttestationRevoked(event: AttestationRevoked): void {
  let attestation = Attestation.load(event.params.id.toHex())
  if (!attestation) return

  attestation.isRevoked = true
  attestation.revokeReason = event.params.reason
  attestation.save()

  let stats = getOrCreateProtocolStats()
  stats.revokedAttestations = stats.revokedAttestations.plus(BigInt.fromI32(1))
  stats.save()
}
