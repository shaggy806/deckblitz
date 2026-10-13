/**
 * The set walk, batch 68, part e (2026-10-12): the cards a crew/saddle power
 * modifier unblocked (`StaticAbility.crewsAs` — `crew-power-mods.test.ts`
 * has the rule itself) — the Pilots, the cards that make Pilot tokens, the
 * Aetherdrift Roads, and Giant Ox. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
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
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const PILOT = "Pilot Token";
const NEO_PILOT = "Pilot Token (Crews Vehicles)";

/** The power `source`'s crew/saddle ability `index` offers `id` with. */
function crewPower(game: Game, source: ObjectId, id: ObjectId, index = 0): number | undefined {
  const offer = game
    .legalActions(A)
    .find((o) => o.kind === "activate-ability" && o.source === source && o.abilityIndex === index);
  return offer?.kind === "activate-ability" ? offer.tapCost?.power?.[id] : undefined;
}

/** Activate `source`'s ability `index` tapping `tap`, settled. */
function payWith(game: Game, source: ObjectId, tap: readonly ObjectId[], index = 0): void {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], tap };
  game.dispatch(action);
  settle(game);
}

/** The newest token named `name` on the battlefield. */
const newest = (game: Game, name: string): ObjectId =>
  [...game.battlefield].reverse().find((id) => game.state.objects[id].cardName === name)!;

describe("the Pilot tokens", () => {
  it("the Aetherdrift Pilot saddles and crews as though its power were 2 greater; the NEO one only crews so", () => {
    const { game } = table();
    const newt = spawn(game, "Archmage's Newt"); // saddle 3
    const copter = spawn(game, "Smuggler's Copter"); // crew 1
    const pilot = spawn(game, PILOT);
    const neo = spawn(game, NEO_PILOT);
    expect(crewPower(game, copter, pilot)).toBe(3);
    expect(crewPower(game, copter, neo)).toBe(3);
    expect(crewPower(game, newt, pilot)).toBe(3);
    expect(crewPower(game, newt, neo)).toBe(1);
    expect(pt(game, pilot)).toEqual({ power: 1, toughness: 1 });
    expect(types(game, neo)).toEqual(["creature"]);
  });
});

describe("Back on Track", () => {
  it("returns a creature or Vehicle card and makes a Pilot", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const copter = toGraveyard(game, "Smuggler's Copter");
    cast(game, toHand(game, "Back on Track"), { targets: [ref(copter)] });
    expect(zone(game, copter)).toBe("battlefield");
    expect(tokensNamed(game, PILOT, A)).toBe(1);
  });

  it("does nothing, Pilot included, once its target has left the graveyard (rule 608.2b)", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Back on Track");
    cast(game, spell, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, PILOT)).toBe(0);
  });
});

describe("Born to Drive", () => {
  it("gives the enchanted creature +1/+1 for each creature and/or Vehicle you control", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Smuggler's Copter"); // a Vehicle, not a creature
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Born to Drive"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("on a Vehicle, only once it's a creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const copter = spawn(game, "Smuggler's Copter"); // 3/3, crew 1
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Born to Drive"), { targets: [ref(copter)] });
    expect(pt(game, copter)).toEqual({ power: 3, toughness: 3 });
    payWith(game, copter, [bears]);
    // The Copter (a creature Vehicle, counted once) and the Bears.
    expect(pt(game, copter)).toEqual({ power: 5, toughness: 5 });
  });

  it("channel: discard it to make two NEO Pilots", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const card = toHand(game, "Born to Drive");
    activate(game, card, 0);
    expect(zone(game, card)).toBe("graveyard");
    expect(tokensNamed(game, NEO_PILOT, A)).toBe(2);
  });
});

describe("Cloudspire Captain", () => {
  it("Mounts and Vehicles you control get +1/+1, and it saddles and crews as though its power were 4", () => {
    const { game } = table();
    const newt = spawn(game, "Archmage's Newt"); // 2/2 Mount, saddle 3
    const copter = spawn(game, "Smuggler's Copter");
    const theirs = spawn(game, "Archmage's Newt", B);
    const captain = spawn(game, "Cloudspire Captain");
    expect(pt(game, newt)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, captain)).toEqual({ power: 2, toughness: 3 });
    expect(crewPower(game, newt, captain)).toBe(4);
    expect(crewPower(game, copter, captain)).toBe(4);
    payWith(game, copter, [captain]);
    expect(pt(game, copter)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("the Roads", () => {
  it.each([
    ["Country Roads", "Plains"],
    ["Foul Roads", "Swamp"],
    ["Reef Roads", "Island"],
    ["Rocky Roads", "Mountain"],
    ["Wild Roads", "Forest"],
  ])("%s enters tapped unless you control a Mount or Vehicle, and sacrifices for a Pilot at sorcery speed", (name, basic) => {
    const { game } = table();
    const first = toHand(game, name);
    game.dispatch({ type: "play-land", player: A, card: first });
    settle(game);
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Archmage's Newt");
    const second = toHand(game, name);
    game.dispatch({ type: "play-land", player: A, card: second });
    settle(game);
    expect(game.state.objects[second].tapped).toBe(false);
    lands(game, basic, 2);
    activate(game, second, 1);
    expect(zone(game, second)).toBe("graveyard");
    expect(tokensNamed(game, PILOT, A)).toBe(1);
  });

  it("the Pilot ability is sorcery-speed only", () => {
    const { game } = table();
    spawn(game, "Smuggler's Copter");
    const roads = spawn(game, "Country Roads");
    lands(game, "Plains", 2);
    toStep(game, "begin-combat");
    expect(
      game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === roads && o.abilityIndex === 1),
    ).toBe(false);
  });
});

describe("Deathless Pilot", () => {
  it("saddles and crews as though its power were 4, and returns from the graveyard to hand for {3}{B}", () => {
    const { game } = table();
    const copter = spawn(game, "Smuggler's Copter");
    const pilot = spawn(game, "Deathless Pilot");
    expect(crewPower(game, copter, pilot)).toBe(4);
    destroy(game, pilot);
    lands(game, "Swamp", 4);
    activate(game, pilot, 0);
    expect(zone(game, pilot)).toBe("hand");
  });
});

describe("Defend the Rider", () => {
  it("either protects a permanent you control or makes a Pilot", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Defend the Rider"), { modes: [0], targets: [ref(bears)] });
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    cast(game, toHand(game, "Defend the Rider"), { modes: [1] });
    expect(tokensNamed(game, PILOT, A)).toBe(1);
  });
});

describe("Dynamite Diver", () => {
  it("when it dies, it deals 1 damage to any target", () => {
    const { game, a } = table();
    const diver = spawn(game, "Dynamite Diver");
    pickTargets(a, B);
    destroy(game, diver);
    expect(life(game, B)).toBe(19);
  });
});

describe("Giant Ox and Hotshot Mechanic", () => {
  it("the Ox crews with its toughness and the Mechanic as though its power were 4 — crew only", () => {
    const { game } = table();
    const copter = spawn(game, "Smuggler's Copter");
    const grizzly = spawn(game, "Drover Grizzly"); // saddle 1
    const ox = spawn(game, "Giant Ox");
    const mechanic = spawn(game, "Hotshot Mechanic");
    expect(crewPower(game, copter, ox)).toBe(6);
    expect(crewPower(game, copter, mechanic)).toBe(4);
    expect(crewPower(game, grizzly, ox)).toBe(0);
    expect(crewPower(game, grizzly, mechanic)).toBe(2);
  });
});

describe("Interface Ace", () => {
  it("untaps when tapped during your turn, once each turn; not during an opponent's", () => {
    const { game } = table();
    const ace = spawn(game, "Interface Ace");
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(ace)]);
    settle(game);
    expect(game.state.objects[ace].tapped).toBe(false);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(ace)]);
    settle(game);
    expect(game.state.objects[ace].tapped).toBe(true);
    toStep(game, "upkeep", B);
    game.debugApplyEffect(B, { kind: "untap", target: 0 }, [ref(ace)]);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(ace)]);
    settle(game);
    expect(game.state.objects[ace].tapped).toBe(true);
  });
});

describe("Prodigy's Prototype", () => {
  it("makes a NEO Pilot whenever one or more Vehicles you control attack", () => {
    const { game, a } = table();
    const prototype = spawn(game, "Prodigy's Prototype");
    const copter = spawn(game, "Smuggler's Copter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    payWith(game, prototype, [bears]);
    payWith(game, copter, [giant]);
    pickModes(a);
    attack(game, a, [prototype, copter]);
    expect(tokensNamed(game, NEO_PILOT, A)).toBe(1);
  });
});

describe("Reckoner Bankbuster", () => {
  it("enters with three charge counters; the last one removed also makes a Treasure and a Pilot", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const bank = enter(game, "Reckoner Bankbuster");
    expect(counters(game, bank, "charge")).toBe(3);
    const before = hand(game).length;
    activate(game, bank, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, bank, "charge")).toBe(2);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
    game.state.objects[bank].counters.charge = 1;
    game.state.objects[bank].tapped = false;
    activate(game, bank, 0);
    expect(counters(game, bank, "charge")).toBe(0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, NEO_PILOT, A)).toBe(1);
    // Crew 3: a NEO Pilot alone.
    payWith(game, bank, [newest(game, NEO_PILOT)], 1);
    expect(types(game, bank)).toContain("creature");
  });
});

describe("Roadside Assistance", () => {
  it("makes a Pilot as it enters; the enchanted permanent gets +1/+1 and lifelink", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Roadside Assistance"), { targets: [ref(bears)] });
    expect(tokensNamed(game, PILOT, A)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Shorikai, Genesis Engine", () => {
  it("{1}, {T}: draws two, discards one and makes a NEO Pilot; crew 8", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const shorikai = spawn(game, "Shorikai, Genesis Engine");
    const before = hand(game).length;
    const graveBefore = graveyard(game).length;
    activate(game, shorikai, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(graveBefore + 1);
    expect(tokensNamed(game, NEO_PILOT, A)).toBe(1);
    // Crew 8: four Pilots that would crew as 3 each — 12 ≥ 8 with three.
    const pilots = [newest(game, NEO_PILOT), spawn(game, NEO_PILOT), spawn(game, NEO_PILOT)];
    expect(pilots.map((id) => crewPower(game, shorikai, id, 1))).toEqual([3, 3, 3]);
    payWith(game, shorikai, pilots, 1);
    expect(types(game, shorikai)).toContain("creature");
  });
});
