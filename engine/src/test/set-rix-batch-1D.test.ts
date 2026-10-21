/**
 * Rivals of Ixalan (RIX; B129), group D. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { PrivateZone } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** How many cards named `name` are in `player`'s `where` zone (or exile). */
const countIn = (game: Game, name: string, where: PrivateZone | "exile", player: PlayerId = A): number => {
  const ids: readonly ObjectId[] =
    where === "exile" ? game.state.zones.shared.exile : game.state.zones.perPlayer[player][where];
  return ids.filter((id) => game.state.objects[id].cardName === name).length;
};
const blessed = (game: Game, player: PlayerId = A): boolean => game.state.players[player].citysBlessing === true;

describe("Expel from Orazca", () => {
  it("without the city's blessing, returns the permanent to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Expel from Orazca"), { targets: [ref(bears)] });
    expect(blessed(game)).toBe(false);
    expect(countIn(game, "Grizzly Bears", "hand", B)).toBe(1);
  });

  it("its own ascend gives the blessing, and then it may put the permanent on top of its owner's library", () => {
    const { game, a } = table();
    lands(game, "Island", 10);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Expel from Orazca"), { targets: [ref(bears)] });
    expect(blessed(game)).toBe(true);
    expect(countIn(game, "Grizzly Bears", "hand", B)).toBe(0);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    expect(countIn(game, "Grizzly Bears", "hand", B)).toBe(1);
  });

  it("with the blessing, declining returns it to its owner's hand", () => {
    const { game, a } = table();
    lands(game, "Island", 10);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    cast(game, toHand(game, "Expel from Orazca"), { targets: [ref(bears)] });
    expect(countIn(game, "Grizzly Bears", "hand", B)).toBe(1);
  });
});

describe("Flood of Recollection", () => {
  it("returns an instant or sorcery card to hand and exiles itself", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const opt = toGraveyard(game, "Opt");
    cast(game, toHand(game, "Flood of Recollection"), { targets: [ref(opt)] });
    expect(countIn(game, "Opt", "hand")).toBe(1);
    expect(countIn(game, "Flood of Recollection", "exile")).toBe(1);
    expect(countIn(game, "Flood of Recollection", "graveyard")).toBe(0);
  });
});

describe("Siegehorn Ceratops", () => {
  it("enrage: two +1/+1 counters when it's dealt damage and survives", () => {
    const { game } = table();
    const ceratops = spawn(game, "Siegehorn Ceratops");
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(ceratops)]);
    settle(game);
    expect(counters(game, ceratops)).toBe(2);
    expect(pt(game, ceratops)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hornswoggle", () => {
  it("counters a creature spell and makes a Treasure", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Hornswoggle"), { targets: [ref(bears)] });
    expect(countIn(game, "Grizzly Bears", "graveyard")).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Orazca Relic", () => {
  it("its sacrifice ability needs the city's blessing", () => {
    const { game } = table();
    const relic = spawn(game, "Orazca Relic");
    lands(game, "Wastes", 5);
    expect(() => activate(game, relic, 1)).toThrow();
    lands(game, "Wastes", 4);
    toStep(game, "begin-combat");
    expect(blessed(game)).toBe(true);
    const before = hand(game).length;
    activate(game, relic, 1);
    expect(life(game)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
    expect(countIn(game, "Orazca Relic", "graveyard")).toBe(1);
  });
});

describe("Baffling End", () => {
  it("exiles a small creature, and leaving gives a target opponent a 3/3 Dinosaur", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const end = enter(game, "Baffling End");
    expect(zone(game, bears)).not.toBe("battlefield");
    expect(countIn(game, "Grizzly Bears", "exile")).toBe(1);
    pickTargets(a, B);
    destroy(game, end);
    expect(tokensNamed(game, "Dinosaur Token", B)).toBe(1);
    expect(tokensNamed(game, "Dinosaur Token", A)).toBe(0);
  });
});

describe("Jade Bearer", () => {
  it("puts the counter on another Merfolk you control, never itself", () => {
    const { game } = table();
    const other = spawn(game, "Jade Bearer");
    const bearer = enter(game, "Jade Bearer");
    expect(counters(game, other)).toBe(1);
    expect(counters(game, bearer)).toBe(0);
  });
});

describe("See Red", () => {
  it("is sacrificed at your end step if you didn't attack", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "See Red"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(countIn(game, "See Red", "graveyard")).toBe(1);
  });

  it("stays if you attacked with any creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const attacker = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "See Red"), { targets: [ref(bears)] });
    attack(game, a, [attacker]);
    toStep(game, "end");
    settle(game);
    expect(countIn(game, "See Red", "graveyard")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Dinosaur Hunter", () => {
  it("destroys a Dinosaur it deals damage to, even as it dies itself", () => {
    const { game } = table();
    const hunter = spawn(game, "Dinosaur Hunter");
    const dino = spawn(game, "Dinosaur Token", B);
    game.debugApplyEffect(A, { kind: "fight", a: 0, b: 1 }, [ref(hunter), ref(dino)]);
    settle(game);
    expect(zone(game, hunter)).not.toBe("battlefield");
    expect(tokensNamed(game, "Dinosaur Token", B)).toBe(0);
  });
});

describe("Forerunner of the Coalition", () => {
  it("another Pirate entering drains each opponent 1", () => {
    const { game } = table();
    spawn(game, "Forerunner of the Coalition");
    enter(game, "Dinosaur Hunter");
    expect(life(game, B)).toBe(19);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(19);
  });
});

describe("Radiant Destiny", () => {
  it("pumps the chosen type, and gives vigilance only with the city's blessing", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    a.chooseCreatureTypeFn = () => "Bear";
    const bears = spawn(game, "Grizzly Bears");
    const hunter = spawn(game, "Dinosaur Hunter");
    cast(game, toHand(game, "Radiant Destiny"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, hunter)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    lands(game, "Plains", 4);
    toStep(game, "begin-combat");
    expect(blessed(game)).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, hunter).has("vigilance")).toBe(false);
  });
});
