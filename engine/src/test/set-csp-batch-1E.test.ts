/**
 * Coldsnap (CSP), group E: the clauses most likely to be wrong on each card.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const altOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("Balduvian Rage", () => {
  it("pumps an attacker by X and draws at the next turn's upkeep", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && quiet(s));
    cast(game, toHand(game, "Balduvian Rage"), { targets: [ref(bears)], x: 3 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    const before = hand(game).length;
    // Bob's upkeep is the next turn's: Alice draws there.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && quiet(s) && s.priority.holder !== null);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Allosaurus Rider", () => {
  it("is cast by exiling two other green cards, and is 1 plus your lands", () => {
    const { game, a } = table();
    const rider = toHand(game, "Allosaurus Rider");
    const g1 = toHand(game, "Grizzly Bears");
    expect(altOffers(game, rider)).toHaveLength(0);
    const g2 = toHand(game, "Llanowar Elves");
    expect(altOffers(game, rider)).toHaveLength(1);
    pickFromZone(a, g1, g2);
    cast(game, rider, { altCost: true });
    expect(zone(game, g1)).toBe("exile");
    expect(zone(game, g2)).toBe("exile");
    expect(zone(game, rider)).toBe("battlefield");
    expect(pt(game, rider)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Forest", 3);
    expect(pt(game, rider)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Diamond Faerie", () => {
  it("pumps only the snow creatures you control, paid with snow mana", () => {
    const { game } = table();
    const faerie = spawn(game, "Diamond Faerie");
    const runner = spawn(game, "Goblin Rimerunner");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Goblin Rimerunner", B);
    lands(game, "Snow-Covered Forest", 2);
    activate(game, faerie);
    expect(pt(game, faerie)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, runner)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("can't be paid without a snow source", () => {
    const { game } = table();
    const faerie = spawn(game, "Diamond Faerie");
    lands(game, "Forest", 2);
    expect(() => activate(game, faerie)).toThrow();
  });
});

describe("Chill to the Bone", () => {
  it("can't target a snow creature", () => {
    const { game } = table();
    const runner = spawn(game, "Goblin Rimerunner", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const chill = toHand(game, "Chill to the Bone");
    expect(() => cast(game, chill, { targets: [ref(runner)], settle: false })).toThrow();
    cast(game, chill, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, runner)).toBe("battlefield");
  });
});

describe("Rune Snag", () => {
  const snag = (snagsInGraveyards: number, bobsLands: number) => {
    const { game, b } = table();
    lands(game, "Island", 2);
    lands(game, "Island", bobsLands, B);
    for (let i = 0; i < snagsInGraveyards; i += 1) toGraveyard(game, "Rune Snag", i % 2 === 0 ? B : A);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    const opt = toHand(game, "Opt", B);
    cast(game, opt, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A);
    pickModes(b, 0);
    cast(game, toHand(game, "Rune Snag"), { targets: [ref(opt)] });
    const untapped = game.battlefield.filter((id) => game.state.objects[id].controller === B && !game.state.objects[id].tapped);
    const countered = game.state.eventLog.some((e) => e.type === "spell-countered");
    return { untapped: untapped.length, countered };
  };

  it("costs {2} with no Rune Snag in any graveyard", () => {
    expect(snag(0, 3)).toEqual({ untapped: 0, countered: false });
  });

  it("adds {2} for each Rune Snag in each graveyard", () => {
    // Two in graveyards (one each): {6}. Bob's five Islands (one paid Opt) can't.
    expect(snag(2, 5).countered).toBe(true);
    // Seven Islands: Opt plus {6}.
    expect(snag(2, 7)).toEqual({ untapped: 0, countered: false });
  });
});

describe("Kjeldoran Javelineer", () => {
  it("deals damage equal to its age counters to an attacking creature", () => {
    const { game, b } = table();
    const javelineer = spawn(game, "Kjeldoran Javelineer");
    game.state.objects[javelineer].counters.age = 2;
    const ogre = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: ogre, defender: A }];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A);
    activate(game, javelineer, 0, { targets: [ref(ogre)] });
    expect(game.state.objects[ogre].damageMarked).toBe(2);
    expect(zone(game, ogre)).toBe("battlefield");
  });
});

describe("Goblin Furrier", () => {
  it("deals no damage to a snow creature blocking it, but does to a nonsnow one", () => {
    const blocked = (blockerName: string) => {
      const { game, a, b } = table();
      const furrier = spawn(game, "Goblin Furrier");
      const blocker = spawn(game, blockerName, B);
      b.declareBlockersFn = () => [{ blocker, attacker: furrier }];
      attack(game, a, [furrier]);
      return zone(game, blocker);
    };
    expect(blocked("Goblin Rimerunner")).toBe("battlefield");
    expect(blocked("Grizzly Bears")).toBe("graveyard");
  });
});

describe("Sound the Call", () => {
  it("makes a Wolf that counts every Sound the Call in every graveyard, itself included", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    toGraveyard(game, "Sound the Call", B);
    cast(game, toHand(game, "Sound the Call"));
    const wolf = game.battlefield.find((id) => game.state.objects[id].cardName === "Wolf Token (Sound the Call)");
    expect(wolf).toBeDefined();
    expect(graveyard(game).length).toBe(1);
    expect(pt(game, wolf!)).toEqual({ power: 3, toughness: 3 });
  });
});
