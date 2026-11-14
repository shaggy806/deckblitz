// Batch 327, group A (EDHREC ranks 15527–18514): one test per card whose
// behaviour is more than a stat line or a copy of a tested pattern.

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  lands,
  pickFromZone,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

describe("Abby, Merciless Soldier", () => {
  it("makes a Cordyceps Infected for each mana spent, then enters under an opponent", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const abby = toHand(game, "Abby, Merciless Soldier");
    cast(game, abby);
    expect(tokensNamed(game, "Cordyceps Infected Token", A)).toBe(3);
    expect(zone(game, abby)).toBe("battlefield");
    expect(controller(game, abby)).toBe(B);
  });
});

describe("Jurin, Leading the Charge", () => {
  it("pumps each attacker by the creatures its own defending player controls", () => {
    const { game, a } = table({ players: 3 });
    const jurin = spawn(game, "Jurin, Leading the Charge");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", C, { tapped: true });
    a.declareAttackersFn = () => [
      { attacker: jurin, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, jurin)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("The Fifteenth Doctor", () => {
  it("offers only an artifact card with mana value 2 or 3 among the milled cards", () => {
    const { game, a } = table();
    toLibrary(game, "Sol Ring");
    const stone = toLibrary(game, "Mind Stone");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, stone);
    enter(game, "The Fifteenth Doctor");
    expect(seen.offered).toEqual([stone]);
    expect(zone(game, stone)).toBe("hand");
  });
});

describe("Swampbenders", () => {
  it("counts every Swamp on the battlefield, its controller's lands now among them", () => {
    const { game } = table();
    const benders = spawn(game, "Swampbenders");
    const [forest] = lands(game, "Forest", 2);
    lands(game, "Swamp", 1, B);
    lands(game, "Forest", 1, B);
    expect(subtypes(game, forest)).toContain("Swamp");
    expect(pt(game, benders)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Chief of the Wilds", () => {
  it("another Wolf's enters trigger triggers twice, Chief's own once", () => {
    const { game } = table();
    const chief = spawn(game, "Chief of the Wilds");
    const before = hand(game).length;
    enter(game, "Arctic Wolves");
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, chief)).toBe(2);
  });

  it("doesn't double a non-Wolf's trigger", () => {
    const { game } = table();
    spawn(game, "Chief of the Wilds");
    const before = hand(game).length;
    enter(game, "Elvish Visionary");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Fire Nation Salvagers", () => {
  it("a creature with a counter connecting brings back a creature card from that player's graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Fire Nation Salvagers");
    expect(counters(game, bears)).toBe(1);
    const theirs = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, theirs);
    attack(game, a, [bears]);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
  });

  it("doesn't trigger for a creature without counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Fire Nation Salvagers");
    const theirs = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, theirs);
    attack(game, a, [bears]);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Electric Seaweed", () => {
  it("this turn, each other creature's death deals 1 to each non-Wall creature, chaining", () => {
    const { game } = table();
    const seaweed = enter(game, "Electric Seaweed");
    const mine = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, mine);
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, seaweed)).toBe("battlefield");
  });
});

describe("Uncle's Musings", () => {
  it("returns up to as many permanent cards as colors spent, then exiles itself", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const cards = ["Grizzly Bears", "Sol Ring", "Forest", "Hill Giant"].map((n) => toGraveyard(game, n));
    toGraveyard(game, "Shock");
    const seen = pickFromZone(a, cards[0], cards[1], cards[2]);
    const musings = toHand(game, "Uncle's Musings");
    cast(game, musings);
    expect(seen.offered).toHaveLength(4);
    expect(cards.slice(0, 3).map((id) => zone(game, id))).toEqual(["hand", "hand", "hand"]);
    expect(zone(game, cards[3])).toBe("graveyard");
    expect(zone(game, musings)).toBe("exile");
  });
});

describe("Aisha of Sparks and Smoke", () => {
  it("offers a sorcery from hand with mana value up to the combat damage dealt", () => {
    const { game, a } = table();
    const aisha = spawn(game, "Aisha of Sparks and Smoke");
    for (const name of ["Divination", "Lava Spike", "Lightning Bolt", "Shivan Dragon", "Mind Rot", "Overrun"]) {
      toHand(game, name);
    }
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_view, offered) => {
      offer = offered;
      return null;
    };
    attack(game, a, [aisha]);
    expect(offer!.cards.map((id) => game.state.objects[id].cardName).sort()).toEqual([
      "Divination",
      "Lava Spike",
      "Mind Rot",
    ]);
  });
});

describe("Captain Rex Nebula", () => {
  it("makes a creature a Vehicle artifact only, its base P/T its mana value", () => {
    const { game, a } = table();
    spawn(game, "Captain Rex Nebula");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, giant)).toEqual(["artifact"]);
    expect(subtypes(game, giant)).toEqual(["Vehicle"]);
    // Hill Giant is a 3/3 with mana value 4.
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Whiplash Trap", () => {
  it("costs {U} only once one opponent has had two creatures enter this turn", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", C);
    enter(game, "Grizzly Bears", B);
    enter(game, "Grizzly Bears", C);
    const trap = toHand(game, "Whiplash Trap");
    // One creature entered under each of two opponents: not yet.
    expect(() =>
      cast(game, trap, { altCost: true, targets: [{ kind: "object", object: x }, { kind: "object", object: y }], settle: false }),
    ).toThrow(/no alternative cost/);
    enter(game, "Grizzly Bears", B);
    cast(game, trap, { altCost: true, targets: [{ kind: "object", object: x }, { kind: "object", object: y }] });
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
  });
});
