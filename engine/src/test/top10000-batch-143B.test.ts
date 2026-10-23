/**
 * Batch 143, group B — EDHREC ranks 7712–7946. One test per clause most
 * likely to be wrong: Collective Defiance's escalate and its discard-then-draw
 * mode, Quickling's "sacrifice it unless", Dreamborn Muse's "that player",
 * Confiscation Coup's energy payment, Lavaclaw Reaches' granted {X} pump,
 * Rise from the Tides' graveyard count, Timber Protector's "other", Thelonite
 * Hermit's face-up trigger and anthem, Green Goblin's two discard triggers and
 * Armored Ascension's live Plains count.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Collective Defiance", () => {
  it("pays {1} per extra mode; the player discards their whole hand and draws that many", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Collective Defiance");
    const bobHand = hand(game, B).length;
    const bobGraveyard = graveyard(game, B).length;
    cast(game, card, { modes: [0, 1, 2], targets: [ref(B), ref(bears), ref(B)] });
    expect(game.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(5);
    expect(graveyard(game, B).length - bobGraveyard).toBe(bobHand + 1); // the hand and the Bears
    expect(hand(game, B)).toHaveLength(bobHand);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("Quickling", () => {
  it("is sacrificed with no other creature to return", () => {
    const { game } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "Quickling"));
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Quickling")).toBe(true);
  });

  it("stays when another creature you control is returned to hand", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    const card = toHand(game, "Quickling");
    cast(game, card);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Dreamborn Muse", () => {
  it("makes the player whose upkeep it is mill their hand size", () => {
    const { game } = table();
    spawn(game, "Dreamborn Muse");
    const bobHand = hand(game, B).length;
    nextTurn(game);
    expect(graveyard(game, B)).toHaveLength(bobHand);
    expect(graveyard(game, A)).toHaveLength(0);
  });
});

describe("Confiscation Coup", () => {
  it("gives four energy and takes the target for energy equal to its mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Confiscation Coup"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.players[A].energy).toBe(2);
  });

  it("keeps all four energy when the payment is declined", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    cast(game, toHand(game, "Confiscation Coup"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(B);
    expect(game.state.players[A].energy).toBe(4);
  });
});

describe("Lavaclaw Reaches", () => {
  it("becomes a 2/2 Elemental with an {X}: +X/+0 ability until end of turn", () => {
    const { game } = table();
    const reaches = spawn(game, "Lavaclaw Reaches");
    spawn(game, "Swamp");
    spawn(game, "Mountain");
    lands(game, "Wastes", 4);
    activate(game, reaches, 1);
    expect(pt(game, reaches)).toEqual({ power: 2, toughness: 2 });
    const granted = game
      .legalActions(A)
      .filter((o) => o.kind === "activate-ability" && o.source === reaches)
      .map((o) => (o as { abilityIndex: number }).abilityIndex)
      .filter((i) => i > 1);
    expect(granted).toHaveLength(1);
    activate(game, reaches, granted[0], { x: 3 });
    expect(pt(game, reaches)).toEqual({ power: 5, toughness: 2 });
    nextTurn(game);
    expect(game.state.objects[reaches].zone).toBe("battlefield");
    expect(pt(game, reaches)).toEqual({ power: 0, toughness: 0 });
  });
});

describe("Rise from the Tides", () => {
  it("makes a tapped Zombie per instant and sorcery card in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 6);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Rise from the Tides"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
    const zombies = game.battlefield.filter((id) => game.state.objects[id].cardName === "Zombie Token");
    expect(zombies.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Timber Protector", () => {
  it("gives other Treefolk and Forests indestructible, but not itself", () => {
    const { game } = table();
    const protector = spawn(game, "Timber Protector");
    const forest = spawn(game, "Forest");
    const bobsForest = spawn(game, "Forest", B);
    expect(keywords(game, forest).has("indestructible")).toBe(true);
    expect(keywords(game, bobsForest).has("indestructible")).toBe(false);
    expect(keywords(game, protector).has("indestructible")).toBe(false);
  });
});

describe("Thelonite Hermit", () => {
  it("makes four Saprolings when turned face up, and they're 2/2", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const hermit = toHand(game, "Thelonite Hermit");
    cast(game, hermit, { via: "face-down" });
    lands(game, "Forest", 5);
    game.dispatch({ type: "turn-face-up", player: A, permanent: hermit, morph: true } as never);
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(4);
    const saproling = game.battlefield.find((id) => game.state.objects[id].cardName === "Saproling Token") as ObjectId;
    expect(pt(game, saproling)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Green Goblin, Nemesis", () => {
  it("a discarded land makes a tapped Treasure; a nonland card a counter on a Goblin", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Green Goblin, Nemesis");
    const matter = spawn(game, "Mind Over Matter");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, goblin);
    const land = hand(game, A)[0];
    a.chooseDiscardsFn = () => [land];
    activate(game, matter, 0, { targets: [ref(bear)] });
    expect(zone(game, land)).toBe("graveyard");
    expect(game.state.objects[bear].tapped).toBe(true);
    const treasure = game.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token") as ObjectId;
    expect(game.state.objects[treasure].tapped).toBe(true);
    expect(counters(game, goblin)).toBe(0);

    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    activate(game, matter, 0, { targets: [ref(bear)] });
    expect(counters(game, goblin)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Armored Ascension", () => {
  it("counts the Plains its controller controls, live", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Armored Ascension"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    spawn(game, "Plains", B);
    spawn(game, "Plains");
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});
