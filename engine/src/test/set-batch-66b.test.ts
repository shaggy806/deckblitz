/**
 * The set walk, batch 66, part b (2026-10-12): Edge of Eternities.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const LANDER = "Lander Token";

const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);

describe("Seedship Impact", () => {
  it("makes a Lander only when the destroyed permanent's mana value was 2 or less", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Seedship Impact"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, LANDER, A)).toBe(1);

    const gunship = spawn(game, "Warmaker Gunship", B);
    cast(game, toHand(game, "Seedship Impact"), { targets: [ref(gunship)] });
    expect(zone(game, gunship)).toBe("graveyard");
    expect(tokensNamed(game, LANDER, A)).toBe(1);
  });
});

describe("Haliya, Ascendant Cadet", () => {
  it("draws once when creatures with +1/+1 counters deal combat damage to a player", () => {
    const { game, a } = table();
    const haliya = spawn(game, "Haliya, Ascendant Cadet");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[haliya].counters["+1/+1"] = 1;
    // The attack trigger's counter goes on the bear: two attackers with
    // counters, one player dealt damage — one card.
    pickTargets(a, bear);
    const before = hand(game).length;
    attack(game, a, [haliya, bear]);
    expect(game.state.objects[bear].counters["+1/+1"]).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw when no creature dealing the damage has a counter", () => {
    const { game, a } = table();
    const haliya = spawn(game, "Haliya, Ascendant Cadet");
    const bear = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Hill Giant");
    // The counter goes on a creature that stays home.
    pickTargets(a, home);
    const before = hand(game).length;
    attack(game, a, [haliya, bear]);
    expect(game.state.objects[home].counters["+1/+1"]).toBe(1);
    expect(life(game, B)).toBe(15);
    expect(hand(game).length).toBe(before);
  });
});

describe("Chrome Companion and Seedship Agrarian", () => {
  it("trigger whenever they become tapped — attacking taps them", () => {
    const { game, a } = table();
    const dog = spawn(game, "Chrome Companion");
    const agrarian = spawn(game, "Seedship Agrarian");
    attack(game, a, [dog, agrarian]);
    expect(life(game, A)).toBe(21);
    expect(tokensNamed(game, LANDER, A)).toBe(1);
  });
});

describe("Warmaker Gunship", () => {
  it("deals damage equal to the artifacts you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B); // an opponent's artifact doesn't count
    const maw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, maw);
    enter(game, "Warmaker Gunship");
    expect(game.state.objects[maw].damageMarked).toBe(2);
  });

  it("is a 4/3 flying artifact creature at six charge counters", () => {
    const { game } = table();
    const gunship = spawn(game, "Warmaker Gunship");
    expect(types(game, gunship)).not.toContain("creature");
    game.state.objects[gunship].counters.charge = 6;
    expect(types(game, gunship)).toContain("creature");
    expect(pt(game, gunship)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, gunship).has("flying")).toBe(true);
  });
});

describe("Beyond the Quiet", () => {
  it("exiles every creature and every Spacecraft, a non-creature one too, and nothing else", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const gunship = spawn(game, "Warmaker Gunship", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Beyond the Quiet"));
    expect([bear, mine, gunship].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Dual-Sun Technique", () => {
  it("grants double strike, and draws only if the creature has a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bear = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Dual-Sun Technique"), { targets: [ref(bear)] });
    expect(keywords(game, bear).has("double-strike")).toBe(true);
    expect(hand(game).length).toBe(before);

    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Dual-Sun Technique"), { targets: [ref(giant)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Mental Modulation", () => {
  it("costs {1} less during your turn only", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const spell = toHand(game, "Mental Modulation");
    const bear = spawn(game, "Grizzly Bears", B);
    expect(canCast(game, spell)).toBe(true);
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(hand(game).length).toBe(before); // one card cast, one drawn

    // Bob's turn, alice with priority: one Island no longer pays for it.
    const again = toHand(game, "Mental Modulation");
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    const islands = named(game, "Island", A);
    for (const id of islands) game.state.objects[id].tapped = true;
    lands(game, "Island", 1);
    expect(canCast(game, again)).toBe(false);
    lands(game, "Island", 1);
    expect(canCast(game, again)).toBe(true);
  });
});

describe("Embrace Oblivion", () => {
  it("needs an artifact or creature to sacrifice, and destroys a Spacecraft that isn't a creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const spell = toHand(game, "Embrace Oblivion");
    const gunship = spawn(game, "Warmaker Gunship", B);
    expect(canCast(game, spell)).toBe(false);
    const ring = spawn(game, "Sol Ring");
    pickPermanents(a, ring);
    cast(game, spell, { targets: [ref(gunship)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, gunship)).toBe("graveyard");
  });
});

describe("Pull Through the Weft", () => {
  it("returns two nonland permanent cards to hand, then two lands to the battlefield tapped", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bear = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const forest = toGraveyard(game, "Forest");
    const island = toGraveyard(game, "Island");
    const spell = toHand(game, "Pull Through the Weft");
    const offer = game
      .legalActions(A)
      .find((x): x is Extract<LegalAction, { kind: "cast-spell" }> => x.kind === "cast-spell" && x.card === spell);
    // A land isn't a nonland permanent card, and a nonland card isn't a land.
    const slots = (offer?.targetOptions ?? []).map((slot) =>
      slot.map((t) => (t.kind === "object" ? t.object : t.player)),
    );
    expect(slots[0]).toEqual(expect.arrayContaining([bear, ring]));
    expect(slots[0]).not.toContain(forest);
    expect(slots[2]).toEqual(expect.arrayContaining([forest, island]));
    expect(slots[2]).not.toContain(bear);
    cast(game, spell, { targets: [ref(bear), ref(ring), ref(forest), ref(island)] });
    expect([bear, ring].map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect([forest, island].map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    expect([forest, island].map((id) => game.state.objects[id].tapped)).toEqual([true, true]);
  });
});

describe("All-Fates Stalker", () => {
  it("exiles a non-Assassin creature until it leaves the battlefield", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const assassin = spawn(game, "Adéwalé, Breaker of Chains", B);
    const seen = watchTargets(a, () => [bear]);
    const stalker = enter(game, "All-Fates Stalker");
    expect(seen.offered[0]).toContain(bear);
    expect(seen.offered[0]).not.toContain(assassin);
    expect(seen.offered[0]).not.toContain(stalker);
    expect(zone(game, bear)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(stalker)]);
    settle(game);
    expect(zone(game, stalker)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Synthesizer Labship", () => {
  it("at two charge counters, makes another artifact a 2/2 flier until end of turn — over a Spacecraft's own size", () => {
    const { game, a } = table();
    const labship = spawn(game, "Synthesizer Labship");
    game.state.objects[labship].counters.charge = 2;
    const gunship = spawn(game, "Warmaker Gunship");
    game.state.objects[gunship].counters.charge = 6;
    expect(pt(game, gunship)).toEqual({ power: 4, toughness: 3 });
    const seen = watchTargets(a, () => [gunship]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered[0]).not.toContain(labship);
    expect(pt(game, gunship)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, gunship).has("flying")).toBe(true);
    // The Labship itself isn't a creature below nine.
    expect(types(game, labship)).not.toContain("creature");
  });

  it("animates a plain artifact, and does nothing below two counters", () => {
    const { game, a } = table();
    const labship = spawn(game, "Synthesizer Labship");
    game.state.objects[labship].counters.charge = 1;
    const ring = spawn(game, "Sol Ring");
    const seen = watchTargets(a, () => [ring]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(0);
    expect(types(game, ring)).not.toContain("creature");

    game.state.objects[labship].counters.charge = 2;
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main", B);
    expect(types(game, ring)).not.toContain("creature");
  });
});
