/**
 * Equip abilities' timing and costs: `equipAtInstantSpeed` (Leonin Shikari,
 * Forge Anew), `alternativeEquipCost` (Forge Anew), and a choice of two whole
 * equip costs (Bloodthorn Flail, Gavel of the Righteous).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  counters,
  enter,
  hand,
  keywords,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const equipOffers = (game: Game, source: ObjectId, player: PlayerId = A): readonly string[] =>
  game
    .legalActions(player)
    .flatMap((a) => (a.kind === "activate-ability" && a.source === source ? [a.text] : []));

const indexOf = (game: Game, source: ObjectId, text: string): number => {
  const offer = game
    .legalActions(A)
    .find((a) => a.kind === "activate-ability" && a.source === source && a.text === text);
  if (offer?.kind !== "activate-ability") throw new Error(`no offer "${text}"`);
  return offer.abilityIndex;
};

const equipWith = (game: Game, source: ObjectId, text: string, on: ObjectId): void =>
  activate(game, source, indexOf(game, source, text), { targets: [ref(on)] });

const attachedTo = (game: Game, id: ObjectId): ObjectId | null | undefined => game.state.objects[id].attachedTo;

describe("equip abilities any time you could cast an instant", () => {
  it("not without it: an upkeep equip is refused", () => {
    const { game } = table({ step: "upkeep" });
    const greaves = spawn(game, "Lightning Greaves");
    spawn(game, "Grizzly Bears");
    expect(equipOffers(game, greaves)).toEqual([]);
  });

  it("Leonin Shikari: at instant speed, on any turn", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Leonin Shikari");
    const greaves = spawn(game, "Lightning Greaves");
    const bears = spawn(game, "Grizzly Bears");
    equipWith(game, greaves, "Equip {0}", bears);
    expect(attachedTo(game, greaves)).toBe(bears);
    nextTurn(game, "upkeep");
    game.advanceUntil((st) => st.priority.holder === A);
    expect(equipOffers(game, greaves)).toContain("Equip {0}");
  });

  it("only its controller's", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Leonin Shikari", B);
    const greaves = spawn(game, "Lightning Greaves");
    spawn(game, "Grizzly Bears");
    expect(equipOffers(game, greaves)).toEqual([]);
  });

  it("Forge Anew: during your turn only", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Forge Anew");
    const greaves = spawn(game, "Lightning Greaves");
    spawn(game, "Grizzly Bears");
    expect(equipOffers(game, greaves)).toContain("Equip {0}");
    nextTurn(game, "upkeep");
    game.advanceUntil((st) => st.priority.holder === A);
    expect(equipOffers(game, greaves)).toEqual([]);
  });

  it("it's the equip ability that's let off, and nothing else", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Leonin Shikari");
    // Reconfigure isn't equip (rule 702.151): a sorcery-speed ability stays one.
    const lizard = spawn(game, "Lizard Blades");
    expect(equipOffers(game, lizard)).toEqual([]);
  });
});

describe("Forge Anew: {0} for the first equip each of your turns", () => {
  const board = (game: Game) => {
    spawn(game, "Forge Anew");
    const sword = spawn(game, "Vulshok Morningstar"); // Equip {2}
    const bears = spawn(game, "Grizzly Bears");
    return { sword, bears };
  };

  it("offers both, pays nothing for the {0}, and offers it no more that turn", () => {
    const { game } = table();
    const { sword, bears } = board(game);
    lands(game, "Plains", 2);
    expect(equipOffers(game, sword)).toEqual(["Equip {2}", "Equip {0}"]);
    equipWith(game, sword, "Equip {0}", bears);
    expect(attachedTo(game, sword)).toBe(bears);
    expect(equipOffers(game, sword)).toEqual(["Equip {2}"]);
  });

  it("the normal cost used up the first too", () => {
    const { game } = table();
    const { sword, bears } = board(game);
    lands(game, "Plains", 4);
    equipWith(game, sword, "Equip {2}", bears);
    expect(equipOffers(game, sword)).toEqual(["Equip {2}"]);
  });

  it("back next turn of yours, and not on an opponent's", () => {
    const { game } = table();
    const { sword, bears } = board(game);
    equipWith(game, sword, "Equip {0}", bears);
    nextTurn(game);
    game.advanceUntil((st) => st.priority.holder === A);
    expect(equipOffers(game, sword)).toEqual([]);
    nextTurn(game);
    expect(equipOffers(game, sword)).toContain("Equip {0}");
  });

  it("an equip before it arrived counts", () => {
    const { game } = table();
    const greaves = spawn(game, "Lightning Greaves");
    const sword = spawn(game, "Vulshok Morningstar");
    const bears = spawn(game, "Grizzly Bears");
    equipWith(game, greaves, "Equip {0}", bears);
    spawn(game, "Forge Anew");
    expect(equipOffers(game, sword)).not.toContain("Equip {0}");
  });

  it("the {0} is offered at instant speed too, and what taxes equip still taxes it", () => {
    const { game } = table({ step: "upkeep" });
    const { sword, bears } = board(game);
    expect(equipOffers(game, sword)).toEqual(["Equip {0}"]);
    equipWith(game, sword, "Equip {0}", bears);
    expect(attachedTo(game, sword)).toBe(bears);
  });

  it("its enters ability returns an Equipment from your graveyard", () => {
    const { game, a } = table();
    const sword = toGraveyard(game, "Vulshok Morningstar");
    pickTargets(a, sword);
    enter(game, "Forge Anew");
    settle(game);
    expect(zone(game, sword)).toBe("battlefield");
  });

  it("a stack item survives the {0} being used: the equip resolves", () => {
    const { game } = table();
    const { sword, bears } = board(game);
    activate(game, sword, indexOf(game, sword, "Equip {0}"), { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Equip—Pay {3} or …", () => {
  it("Bloodthorn Flail: three mana or a discard", () => {
    const { game, a } = table();
    const flail = spawn(game, "Bloodthorn Flail");
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Plains");
    expect(equipOffers(game, flail)).toEqual(["Equip—Discard a card"]);
    lands(game, "Swamp", 3);
    expect(equipOffers(game, flail)).toEqual(["Equip {3}", "Equip—Discard a card"]);
    a.chooseDiscardsFn = () => [card];
    const before = hand(game).length;
    equipWith(game, flail, "Equip—Discard a card", bears);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });

  it("Gavel of the Righteous: a counter a combat, +1/+1 each, double strike at four, and a counter pays to equip", () => {
    const { game } = table();
    const gavel = spawn(game, "Gavel of the Righteous");
    const bears = spawn(game, "Grizzly Bears");
    expect(equipOffers(game, gavel)).toEqual([]);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, gavel, "charge")).toBe(1);
    toStep(game, "postcombat-main");
    expect(equipOffers(game, gavel)).toEqual(["Equip—Remove a counter from this Equipment"]);
    game.state.objects[gavel].counters.charge = 5;
    equipWith(game, gavel, "Equip—Remove a counter from this Equipment", bears);
    expect(counters(game, gavel, "charge")).toBe(4);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    game.state.objects[gavel].counters.charge = 3;
    expect(keywords(game, bears).has("double-strike")).toBe(false);
  });

  it("with Forge Anew, one {0} for the choice of costs", () => {
    const { game } = table();
    spawn(game, "Forge Anew");
    const flail = spawn(game, "Bloodthorn Flail");
    spawn(game, "Grizzly Bears");
    toHand(game, "Plains");
    lands(game, "Swamp", 3);
    expect(equipOffers(game, flail)).toEqual(["Equip {3}", "Equip—Discard a card", "Equip {0}"]);
  });
});
