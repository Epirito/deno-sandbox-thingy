import { Entity } from "../mod.ts"

import { TerrainSpec } from "../logic/terrain.ts"

export const terrainSpecs = {
    dirt: new TerrainSpec("dirt"),
    sand: new TerrainSpec("sand"),
    herb: new TerrainSpec("herb"),
    shallowWater: new TerrainSpec("shallow water"),
    deepWater: new TerrainSpec("deep water"),
    field: new TerrainSpec("field"),
    crops: new TerrainSpec("crops"),
    youngCrops: new TerrainSpec("young crops"),
    coalOre: new TerrainSpec("coal ore", {pick: 1}),
    ironOre: new TerrainSpec("iron ore", {pick: 1}),
}