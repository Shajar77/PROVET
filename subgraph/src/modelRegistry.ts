import {
  ModelRegistered,
  ModelUpdated,
  ModelDeactivated,
  ModelReactivated,
  ModelCertified
} from '../generated/ModelRegistry/ModelRegistry'
import { Model, ModelVersion, ProtocolStats } from '../generated/schema'
import { Bytes, BigInt } from '@graphprotocol/graph-ts'

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

export function handleModelRegistered(event: ModelRegistered): void {
  let model = new Model(event.params.modelId.toHex())
  model.modelId = event.params.modelId
  model.owner = event.params.owner
  model.name = event.params.name
  model.currentVersion = event.params.version
  model.modelHash = event.params.modelHash
  model.metadataURI = event.params.metadataURI
  model.isActive = true
  model.totalVersions = BigInt.zero()
  model.attestationsCount = BigInt.zero()
  model.tags = []
  model.registeredAt = event.block.timestamp
  model.updatedAt = event.block.timestamp
  model.save()

  let stats = getOrCreateProtocolStats()
  stats.totalModels = stats.totalModels.plus(BigInt.fromI32(1))
  stats.activeModels = stats.activeModels.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleModelUpdated(event: ModelUpdated): void {
  let model = Model.load(event.params.modelId.toHex())
  if (!model) return

  model.currentVersion = event.params.newVersion
  model.modelHash = event.params.newVersionHash
  model.metadataURI = event.params.metadataURI
  model.totalVersions = model.totalVersions.plus(BigInt.fromI32(1))
  model.updatedAt = event.block.timestamp
  model.save()

  let version = new ModelVersion(
    event.params.modelId.toHex() + '-' + event.params.newVersionHash.toHex()
  )
  version.model = event.params.modelId.toHex()
  version.versionHash = event.params.newVersionHash
  version.version = event.params.newVersion
  version.changeNotes = event.params.changeNotes
  version.metadataURI = event.params.metadataURI
  version.timestamp = event.block.timestamp
  version.isCertified = false
  version.certifiedBy = Bytes.empty()
  version.save()
}

export function handleModelDeactivated(event: ModelDeactivated): void {
  let model = Model.load(event.params.modelId.toHex())
  if (!model) return

  model.isActive = false
  model.updatedAt = event.block.timestamp
  model.save()

  let stats = getOrCreateProtocolStats()
  stats.activeModels = stats.activeModels.minus(BigInt.fromI32(1))
  stats.save()
}

export function handleModelReactivated(event: ModelReactivated): void {
  let model = Model.load(event.params.modelId.toHex())
  if (!model) return

  model.isActive = true
  model.updatedAt = event.block.timestamp
  model.save()

  let stats = getOrCreateProtocolStats()
  stats.activeModels = stats.activeModels.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleModelCertified(event: ModelCertified): void {
  let modelId = event.params.id.toHex()
  let model = Model.load(modelId)
  if (!model) return

  // Get the current version to certify
  let versions = model.versions
  let versionIndex = event.params.versionIndex.toI32()
  
  if (versions && versionIndex < versions.length) {
    let version = ModelVersion.load(versions[versionIndex])
    if (version) {
      version.isCertified = true
      version.certifiedBy = event.params.certifiedBy
      version.save()
    }
  }
}
