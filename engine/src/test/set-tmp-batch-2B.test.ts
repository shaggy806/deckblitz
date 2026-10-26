/**
 * Tempest (TMP, B181), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Tempest group B (batch 2)", () => {
  it("Avenging Angel may go on top of its owner's library when it dies", () => {
    const { game, a } = table();
    const angel = spawn(game, "Avenging Angel");
    pickModes(a, 0);
    destroy(game, angel);
    expect(zone(game, angel)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(angel);
  });

  it("Barbed Sliver gives Slivers a {2}: +1/+0 ability", () => {
    const { game } = table();
    const sliver = spawn(game, "Barbed Sliver");
    lands(game, "Mountain", 2);
    activate(game, sliver, 0);
    expect(pt(game, sliver)).toEqual({ power: 3, toughness: 2 });
  });

  it("Havoc makes an opponent casting a white spell lose 2 life", () => {
    const { game } = table();
    spawn(game, "Havoc");
    nextTurn(game);
    lands(game, "Plains", 1, B);
    cast(game, toHand(game, "Savannah Lions", B), { player: B });
    expect(life(game, B)).toBe(18);
  });

  it("Mogg Squad gets -1/-1 for each other creature, either side's", () => {
    const { game } = table();
    const squad = spawn(game, "Mogg Squad");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, squad)).toEqual({ power: 1, toughness: 1 });
  });

  it("Opportunist pings only a creature that was dealt damage this turn", () => {
    const { game } = table();
    const opp = spawn(game, "Opportunist");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, opp, 0, { targets: [ref(giant)] })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    activate(game, opp, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Segmented Wurm gets a -1/-1 counter when it becomes a target", () => {
    const { game } = table();
    const wurm = spawn(game, "Segmented Wurm");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(wurm)] });
    expect(counters(game, wurm, "-1/-1")).toBe(1);
    expect(pt(game, wurm)).toEqual({ power: 7, toughness: 7 });
  });

  it("Spinal Graft destroys the enchanted creature when it becomes a target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Spinal Graft"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Thumbscrews deals 1 damage at upkeep with five or more cards in hand", () => {
    const { game, a } = table();
    spawn(game, "Thumbscrews");
    pickTargets(a, B);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});
