/**
 * A granted "at the beginning of your upkeep, sacrifice this permanent unless
 * you pay its mana cost" (Essence Leak, Pendrell Flux): the upkeep trigger
 * the enchanted permanent has, its controller's, with an `unless` option of
 * `payManaCostOf: "source"` — the permanent's own mana cost (rule 107.3h).
 * Essence Leak grants it only while the permanent is red or green.
 */
import { describe, expect, it } from "vitest";

import { B, lands, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

describe("sacrifice unless you pay its mana cost", () => {
  it("Pendrell Flux: its controller pays {3}{R} on their upkeep and keeps it", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const mountains = lands(game, "Mountain", 4, B);
    const flux = spawn(game, "Pendrell Flux");
    game.state.objects[flux].attachedTo = giant;
    pickModes(b, 0);
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(mountains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Pendrell Flux: three Mountains can't pay {3}{R}, so it's sacrificed", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3, B);
    const flux = spawn(game, "Pendrell Flux");
    game.state.objects[flux].attachedTo = giant;
    pickModes(b, 0);
    nextTurn(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Pendrell Flux: declining sacrifices it", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 4, B);
    const flux = spawn(game, "Pendrell Flux");
    game.state.objects[flux].attachedTo = giant;
    pickModes(b);
    nextTurn(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Essence Leak: a green permanent has it, a white one doesn't", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    const one = spawn(game, "Essence Leak");
    const two = spawn(game, "Essence Leak");
    game.state.objects[one].attachedTo = bears;
    game.state.objects[two].attachedTo = lions;
    pickModes(b);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
  });

  it("Disruption Aura: an Ornithopter's {0} is paid with nothing", () => {
    const kept = (pay: boolean): boolean => {
      const { game, b } = table();
      const thopter = spawn(game, "Ornithopter", B);
      const aura = spawn(game, "Disruption Aura");
      game.state.objects[aura].attachedTo = thopter;
      if (pay) pickModes(b, 0);
      else pickModes(b);
      nextTurn(game);
      return zone(game, thopter) === "battlefield";
    };
    expect(kept(true)).toBe(true);
    expect(kept(false)).toBe(false);
  });

  it("Essence Leak: a red noncreature permanent pays its own cost", () => {
    const { game, b } = table();
    const rod = spawn(game, "Furnace of Rath", B);
    const mountains = lands(game, "Mountain", 4, B);
    const leak = spawn(game, "Essence Leak");
    game.state.objects[leak].attachedTo = rod;
    pickModes(b, 0);
    nextTurn(game);
    expect(zone(game, rod)).toBe("battlefield");
    expect(mountains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
