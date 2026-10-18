/**
 * March of the Machine (MOM/MOC), batch 1, group h (2026-10-17): the cards
 * that mention battles. Each battle clause is tried against a real battle,
 * Invasion of Lorwyn. Written from the Oracle text on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** `player` casts Invasion of Lorwyn (5 defense) on their own turn. */
function invade(game: Game, player: PlayerId = A): ObjectId {
  lands(game, "Swamp", 3, player);
  lands(game, "Forest", 3, player);
  const battle = toHand(game, "Invasion of Lorwyn", player);
  cast(game, battle, { player });
  return battle;
}

const libraryOf = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Run to postcombat main with `attackers` attacking `defender`. */
function attackWith(
  game: Game,
  seat: ReturnType<typeof table>["a"],
  attackers: readonly { attacker: ObjectId; defender: PlayerId | ObjectId }[],
): void {
  seat.declareAttackersFn = () => attackers;
  game.advanceUntil(
    (s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0,
  );
}

describe("Halo-Charged Skaab", () => {
  it("each player mills two, then you may put an instant, sorcery or battle card from your graveyard on top", () => {
    const { game, a } = table();
    toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Grizzly Bears");
    const seen = { offered: [] as readonly ObjectId[] };
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.offered = eligible;
      return eligible.filter((id) => game.state.objects[id].cardName === "Lightning Bolt");
    };
    enter(game, "Halo-Charged Skaab");
    expect(graveyard(game, B).length).toBe(2);
    // The milled Bolt is offered (the ruling); the milled Bears isn't.
    const names = seen.offered.map((id) => game.state.objects[id].cardName);
    expect(names).toContain("Lightning Bolt");
    expect(names).not.toContain("Grizzly Bears");
    expect(game.state.objects[libraryOf(game)[0]!].cardName).toBe("Lightning Bolt");
  });
});

describe("Portent Tracker", () => {
  it("removes a defense counter from a battle an opponent protects", () => {
    const { game } = table();
    const battle = invade(game);
    const tracker = spawn(game, "Portent Tracker");
    activate(game, tracker, 1, { targets: [ref(battle)] });
    expect(counters(game, battle, "defense")).toBe(4);
  });
});

describe("Etched Host Doombringer", () => {
  it("puts three defense counters on a battle you protect", () => {
    const { game, a } = table();
    nextTurn(game);
    const battle = invade(game, B);
    expect(game.state.objects[battle].protector).toBe(A);
    nextTurn(game);
    pickModes(a, 1);
    pickTargets(a, battle);
    enter(game, "Etched Host Doombringer");
    expect(counters(game, battle, "defense")).toBe(8);
  });

  it("removes three from a battle an opponent protects", () => {
    const { game, a } = table();
    const battle = invade(game);
    pickModes(a, 1);
    pickTargets(a, battle);
    enter(game, "Etched Host Doombringer");
    expect(counters(game, battle, "defense")).toBe(2);
  });
});

describe("Into the Fire", () => {
  it("deals 2 damage to each creature, planeswalker and battle", () => {
    const { game } = table();
    const battle = invade(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Into the Fire"), { modes: [0] });
    expect(counters(game, battle, "defense")).toBe(3);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Assimilate Essence", () => {
  it("if the creature spell's controller pays {4}, the caster incubates 2", () => {
    const { game, b } = table();
    lands(game, "Island", 2);
    nextTurn(game);
    lands(game, "Forest", 6, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bears));
    pickModes(b, 0);
    cast(game, toHand(game, "Assimilate Essence"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    const incubators = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.cardName === "Incubator Token" && o.controller === A,
    );
    expect(incubators.length).toBe(1);
    expect(counters(game, incubators[0]!.id)).toBe(2);
  });
});

describe("Deeproot Wayfinder", () => {
  it("dealing combat damage to a battle surveils 1, then may return a land from the graveyard tapped", () => {
    const { game, a } = table();
    const battle = invade(game);
    const wayfinder = spawn(game, "Deeproot Wayfinder");
    const forest = toGraveyard(game, "Forest");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === forest);
    attackWith(game, a, [{ attacker: wayfinder, defender: battle }]);
    expect(counters(game, battle, "defense")).toBe(3);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Traumatic Revelation", () => {
  it("discards the creature card you choose, and doesn't incubate", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 2);
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toEqual([bears]);
      return [bears];
    };
    cast(game, toHand(game, "Traumatic Revelation"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Incubator Token")).toBe(0);
  });

  it("with no creature or battle card to choose, incubates 3", () => {
    const { game } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Traumatic Revelation"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("hand");
    const incubator = Object.values(game.state.objects).find(
      (o) => o.zone === "battlefield" && o.cardName === "Incubator Token" && o.controller === A,
    );
    expect(incubator).toBeDefined();
    expect(counters(game, incubator!.id)).toBe(3);
  });
});

describe("Atraxa's Fall", () => {
  it("destroys a battle", () => {
    const { game } = table();
    const battle = invade(game);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Atraxa's Fall"), { targets: [ref(battle)] });
    expect(zone(game, battle)).toBe("graveyard");
  });
});

describe("Attentive Skywarden", () => {
  it("dealing combat damage to a battle transforms an Incubator token you control", () => {
    const { game, a } = table();
    const battle = invade(game);
    game.debugApplyEffect(A, { kind: "incubate", amount: 2 });
    const incubator = Object.values(game.state.objects).find(
      (o) => o.zone === "battlefield" && o.cardName === "Incubator Token",
    )!.id;
    const skywarden = spawn(game, "Attentive Skywarden");
    pickTargets(a, incubator);
    attackWith(game, a, [{ attacker: skywarden, defender: battle }]);
    expect(game.state.objects[incubator].face).toBe(1);
    expect(types(game, incubator)).toContain("creature");
    expect(pt(game, incubator)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("War-Trained Slasher", () => {
  it("doubles its power attacking a battle, not attacking a player", () => {
    const { game, a } = table();
    const battle = invade(game);
    const slasher = spawn(game, "War-Trained Slasher");
    a.declareAttackersFn = () => [{ attacker: slasher, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, slasher)).toEqual({ power: 8, toughness: 3 });

    const { game: g2, a: a2 } = table();
    const other = spawn(g2, "War-Trained Slasher");
    a2.declareAttackersFn = () => [{ attacker: other, defender: B }];
    g2.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(g2, other)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Thrashing Frontliner", () => {
  it("gets +1/+1 attacking a battle", () => {
    const { game, a } = table();
    const battle = invade(game);
    const lizard = spawn(game, "Thrashing Frontliner");
    a.declareAttackersFn = () => [{ attacker: lizard, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, lizard)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Flitting Guerrilla", () => {
  it("dies: each player mills two, then exiling it puts a creature or battle card from your graveyard on top", () => {
    const { game, a } = table();
    const guerrilla = spawn(game, "Flitting Guerrilla");
    const battleCard = toGraveyard(game, "Invasion of Lorwyn");
    pickModes(a, 0);
    pickTargets(a, battleCard);
    destroy(game, guerrilla);
    expect(graveyard(game, B).length).toBe(2);
    expect(zone(game, guerrilla)).toBe("exile");
    expect(zone(game, battleCard)).toBe("library");
    expect(libraryOf(game)[0]).toBe(battleCard);
  });
});

describe("Begin the Invasion", () => {
  it("puts a battle found onto the battlefield, with its defense and a protector", () => {
    const { game, a } = table();
    const battleCard = toLibrary(game, "Invasion of Lorwyn");
    toLibrary(game, "Invasion of Lorwyn");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    lands(game, "Wastes", 2);
    const seen = { min: -1, max: -1 };
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      seen.min = min;
      seen.max = max;
      return eligible.filter((id) => id === battleCard);
    };
    cast(game, toHand(game, "Begin the Invasion"), { x: 2 });
    expect(zone(game, battleCard)).toBe("battlefield");
    expect(counters(game, battleCard, "defense")).toBe(5);
    expect(game.state.objects[battleCard].protector).toBe(B);
    expect(seen).toEqual({ min: 0, max: 2 });
  });
});

describe("Doomskar Warrior", () => {
  it("dealing combat damage to a battle looks at that many cards and may take a creature or land", () => {
    const { game, a } = table();
    const battle = invade(game);
    const warrior = spawn(game, "Doomskar Warrior");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = { looked: 0 };
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.looked = eligible.length;
      return eligible.filter((id) => id === bears);
    };
    attackWith(game, a, [{ attacker: warrior, defender: battle }]);
    expect(counters(game, battle, "defense")).toBe(1);
    // Four damage: four cards looked at (the Bears and three Wastes, all eligible).
    expect(seen.looked).toBe(4);
    expect(zone(game, bears)).toBe("hand");
  });

  it("backup grants another creature trample and the damage trigger until end of turn", () => {
    const { game, a } = table();
    const battle = invade(game);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Doomskar Warrior"));
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    const elf = toLibrary(game, "Llanowar Elves");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === elf);
    attackWith(game, a, [{ attacker: bears, defender: battle }]);
    expect(counters(game, battle, "defense")).toBe(2);
    expect(zone(game, elf)).toBe("hand");
    expect(hand(game).includes(elf)).toBe(true);
  });
});

describe("Rampaging Geoderm", () => {
  it("a creature attacking a battle gets a +1/+1 counter instead of the pump", () => {
    const { game, a } = table();
    const battle = invade(game);
    spawn(game, "Rampaging Geoderm");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("a creature attacking a player gets +1/+1 until end of turn and no counter", () => {
    const { game, a } = table();
    spawn(game, "Rampaging Geoderm");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(counters(game, bears)).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tandem Takedown", () => {
  it("two creatures you control each get +1/+0 and deal damage equal to their power to a battle", () => {
    const { game } = table();
    const battle = invade(game);
    const elf1 = spawn(game, "Llanowar Elves");
    const elf2 = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Tandem Takedown"), { targets: [ref(elf1), ref(elf2), ref(battle)] });
    expect(pt(game, elf1)).toEqual({ power: 2, toughness: 1 });
    expect(counters(game, battle, "defense")).toBe(1);
  });
});
