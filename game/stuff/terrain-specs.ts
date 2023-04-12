import { Entity } from "../mod.ts"

import { TerrainSpec } from "../logic/terrain.ts"

export const terrainSpecs = {
    dirt: new TerrainSpec("dirt"),
    sand: new TerrainSpec("sand"),
    shallowWater: new TerrainSpec("shallow water"),
    deepWater: new TerrainSpec("deep water"),
    field: new TerrainSpec("field"),
    crops: new TerrainSpec("crops"),
    youngCrops: new TerrainSpec("young crops"),
    coalOre: new TerrainSpec("coal ore"),
    ironOre: new TerrainSpec("iron ore"),
}