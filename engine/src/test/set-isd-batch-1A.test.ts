/**
 * Dark Ascension's rest and Innistrad's next 60 (DKA, ISD; B188), group A.
 * One test per card whose behaviour is more than a stat line, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Helvault", () => {
  it("returns what both its abilities exiled when it goes to the graveyard", () => {
    const { game } = table();
    const vault = spawn(game, "Helvault");
    lands(game, "Wastes", 8);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, vault, 0, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("exile");
    game.state.objects[vault].tapped = false;
    activate(game, vault, 1, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, vault);
    const back = Object.values(game.state.objects).filter(
      (o) => o.cardName === "Grizzly Bears" && o.zone === "battlefield",
    );
    expect(back.map((o) => o.controller).sort()).toEqual([A, B].sort());
  });
});

describe("Saving Grasp", () => {
  it("returns a creature you own that another player controls to your hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].controller = B;
    const grasp = toHand(game, "Saving Grasp");
    const before = hand(game, A).length;
    cast(game, grasp, { targets: [ref(bears)] });
    expect(hand(game, A).length).toBe(before);
    expect(hand(game, A).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Break of Day", () => {
  it("adds indestructible only at 5 or less life", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Break of Day"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    game.state.players[A].life = 5;
    cast(game, toHand(game, "Break of Day"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Mayor of Avabruck // Howlpack Alpha", () => {
  it("pumps other Humans, then as Howlpack Alpha pumps Wolves and Werewolves but not others", () => {
    const { game } = table();
    const mayor = spawn(game, "Mayor of Avabruck");
    const human = spawn(game, "Elder of Laurels");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, human)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, mayor)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(pt(game, mayor)).toEqual({ power: 3, toughness: 3 });
    const wolf = spawn(game, "Wolf Token");
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, human)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Ludevic's Test Subject", () => {
  it("transforms on the fifth hatchling counter, with the counters removed", () => {
    const { game } = table();
    lands(game, "Island", 10);
    const egg = spawn(game, "Ludevic's Test Subject");
    for (let i = 0; i < 4; i++) activate(game, egg);
    expect(counters(game, egg, "hatchling")).toBe(4);
    expect(pt(game, egg)).toEqual({ power: 0, toughness: 3 });
    activate(game, egg);
    expect(counters(game, egg, "hatchling")).toBe(0);
    expect(pt(game, egg)).toEqual({ power: 13, toughness: 13 });
  });
});

describe("Skirsdag High Priest", () => {
  it("makes a Demon by tapping two others, only once a creature died this turn", () => {
    const { game } = table();
    const priest = spawn(game, "Skirsdag High Priest");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    expect(() => activate(game, priest)).toThrow();
    destroy(game, spawn(game, "Grizzly Bears", B));
    activate(game, priest);
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(1);
    expect(game.state.objects[one].tapped && game.state.objects[two].tapped).toBe(true);
  });
});

describe("Full Moon's Rise", () => {
  it("pumps Werewolves and regenerates them all when sacrificed", () => {
    const { game } = table();
    const rise = spawn(game, "Full Moon's Rise");
    const gang = spawn(game, "Instigator Gang");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, gang)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, gang).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
    activate(game, rise);
    expect(zone(game, rise)).toBe("graveyard");
    destroy(game, gang);
    expect(zone(game, gang)).toBe("battlefield");
    expect(game.state.objects[gang].tapped).toBe(true);
  });
});

describe("Burning Vengeance", () => {
  it("deals 2 when you cast a spell with flashback from your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Burning Vengeance");
    lands(game, "Island", 3);
    const think = toGraveyard(game, "Think Twice");
    pickTargets(a, B);
    cast(game, think, { via: "flashback" });
    expect(life(game, B)).toBe(18);
  });
});
