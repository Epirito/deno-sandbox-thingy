import { Entity } from "../mod.ts"

import { TerrainSpec } from "../logic/terrain.ts"

export const terrainSpecs = {
    dirt: new TerrainSpec("dirt"),
    grass: new TerrainSpec("grass"),
    sand: new TerrainSpec("sand"),
    snow: new TerrainSpec("snow"),
    herb: new TerrainSpec("herb"),
    tree: new TerrainSpec("tree", {axe: 1}, true),
    pineTree: new TerrainSpec("pine tree", {axe: 1}, true),
    palmTree: new TerrainSpec("palm tree", {axe: 1}, true),
    shallowWater: new TerrainSpec("shallow water"),
    deepWater: new TerrainSpec("deep water"),
    field: new TerrainSpec("field"),
    crops: new TerrainSpec("crops"),
    youngCrops: new TerrainSpec("young crops"),
    coalOre: new TerrainSpec("coal ore", {pick: 1}),
    ironOre: new TerrainSpec("iron ore", {pick: 1}),
}