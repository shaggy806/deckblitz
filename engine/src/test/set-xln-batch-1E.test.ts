/**
 * Ixalan and Commander 2017, group E: the Galleon's end-of-combat flip, the
 * Chemister's linked free casts, the Magus's X, the Lich's per-player modes
 * and the rest of the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

/** Crew `vehicle` tapping `crew`. */
function crewWith(game: Game, vehicle: ObjectId, crew: readonly ObjectId[]): void {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap: crew };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

const landsOnBattlefield = (game: Game): ObjectId[] => game.battlefield.filter((id) => types(game, id).includes("land"));

describe("Conqueror's Galleon", () => {
  it("attacks, then at end of combat is exiled and returns transformed, untapped", () => {
    const { game, a } = table();
    const galleon = spawn(game, "Conqueror's Galleon");
    crewWith(game, galleon, [spawn(game, "Hill Giant"), spawn(game, "Grizzly Bears")]);
    attack(game, a, [galleon]);
    expect(life(game, B)).toBe(18);
    const foothold = landsOnBattlefield(game);
    expect(foothold).toHaveLength(1);
    expect(types(game, foothold[0])).not.toContain("artifact");
    expect(game.state.objects[foothold[0]].tapped).toBe(false);
  });

  it("isn't exiled if it doesn't survive combat", () => {
    const { game, a } = table();
    const galleon = spawn(game, "Conqueror's Galleon");
    crewWith(game, galleon, [spawn(game, "Hill Giant"), spawn(game, "Grizzly Bears")]);
    a.declareAttackersFn = () => [{ attacker: galleon, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    expect(game.state.delayedTriggers).toHaveLength(1); // the attack trigger resolved
    destroy(game, galleon);
    toStep(game, "postcombat-main");
    expect(zone(game, galleon)).toBe("graveyard");
    expect(landsOnBattlefield(game)).toHaveLength(0);
  });
});

describe("Izzet Chemister", () => {
  it("casts the cards it exiled, free, as its last ability resolves", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const chemister = spawn(game, "Izzet Chemister");
    const divination = toGraveyard(game, "Divination");
    activate(game, chemister, 0, { targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("exile");
    game.state.objects[chemister].tapped = false;
    let offers = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offers += 1;
      const way = offer.casts[0];
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const before = hand(game).length;
    activate(game, chemister, 1);
    expect(offers).toBeGreaterThan(0);
    expect(zone(game, chemister)).toBe("graveyard");
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Magus of the Mind", () => {
  it("exiles one plus the number of spells cast this turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const magus = spawn(game, "Magus of the Mind");
    cast(game, toHand(game, "Divination"));
    const exiled = game.state.zones.shared.exile.length;
    activate(game, magus, 0);
    expect(zone(game, magus)).toBe("graveyard");
    expect(game.state.zones.shared.exile.length).toBe(exiled + 2);
  });
});

describe("Vindictive Lich", () => {
  it("dies: each chosen mode at a different opponent", () => {
    const { game, a } = table({ players: 3 });
    const lich = spawn(game, "Vindictive Lich");
    const handB = hand(game, B).length;
    pickModes(a, 1, 2);
    pickTargets(a, B, C);
    destroy(game, lich);
    expect(hand(game, B).length).toBe(handB - 2);
    expect(life(game, C)).toBe(15);
    expect(life(game, B)).toBe(20);
  });
});

describe("Sanguine Sacrament", () => {
  it("gains twice X life and goes to the bottom of its owner's library", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const sacrament = toHand(game, "Sanguine Sacrament");
    cast(game, sacrament, { x: 3 });
    expect(life(game)).toBe(26);
    expect(zone(game, sacrament)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect([library[0], library[library.length - 1]]).toContain(sacrament);
  });
});

describe("Waker of the Wilds", () => {
  it("puts X counters on a land, which becomes a 0/0 Elemental creature with haste", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const target = spawn(game, "Forest");
    const waker = spawn(game, "Waker of the Wilds");
    activate(game, waker, 0, { x: 2, targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, target).has("haste")).toBe(true);
  });
});

describe("Tilonalli's Skinshifter", () => {
  it("becomes a copy of another attacking creature until end of turn", () => {
    const { game, a } = table();
    const skinshifter = spawn(game, "Tilonalli's Skinshifter");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [skinshifter, bears]);
    expect(pt(game, skinshifter)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(16);
    toStep(game, "precombat-main", B);
    expect(pt(game, skinshifter)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Wanted Scoundrels", () => {
  it("dies: the target opponent creates two Treasures", () => {
    const { game, a } = table();
    const scoundrels = spawn(game, "Wanted Scoundrels");
    pickTargets(a, B);
    destroy(game, scoundrels);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Burning Sun's Avatar", () => {
  it("deals 3 to the opponent and 3 to up to one creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, bears);
    enter(game, "Burning Sun's Avatar");
    expect(life(game, B)).toBe(17);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Verdant Rebirth", () => {
  it("a creature dying this turn returns to its owner's hand, and you draw", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const rebirth = toHand(game, "Verdant Rebirth");
    const before = hand(game).length;
    cast(game, rebirth, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before); // the spell left, a card came in
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Fiery Cannonade", () => {
  it("deals 2 to each non-Pirate creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const pirate = spawn(game, "Marauding Looter", B);
    cast(game, toHand(game, "Fiery Cannonade"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, pirate)).toBe("battlefield");
  });
});

describe("Jace, Ingenious Mind-Mage", () => {
  it("−9 gains control of up to three target creatures for good", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, Ingenious Mind-Mage");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    loyalty(game, jace, -9, { atLeast: 9, targets: [ref(one), ref(two), null] });
    expect([controller(game, one), controller(game, two)]).toEqual([A, A]);
    toStep(game, "precombat-main", B);
    expect([controller(game, one), controller(game, two)]).toEqual([A, A]);
  });
});

describe("Curse of Vitality", () => {
  it("you gain 2 life when the enchanted player is attacked", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Curse of Vitality"), { targets: [ref(B)] });
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game)).toBe(22);
  });
});
