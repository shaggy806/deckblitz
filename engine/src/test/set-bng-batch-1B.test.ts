/**
 * Born of the Gods (BNG; B164), group B. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  hand,
  lands,
  life,
  pickFromZone,
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
  zone,
} from "./harness.js";

type AttackOffer = { kind: "declare-attackers"; eligible: readonly string[] };

function attackEligible(game: ReturnType<typeof table>["game"]): readonly string[] {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((a) => a.kind === "declare-attackers") as AttackOffer | undefined;
  return offer?.eligible ?? [];
}

describe("Peregrination", () => {
  it("puts one basic land onto the battlefield tapped and the other into hand", () => {
    const { game, a } = table();
    const f1 = toLibrary(game, "Forest");
    const f2 = toLibrary(game, "Forest");
    lands(game, "Forest", 4);
    pickFromZone(a, f1, f2);
    const card = toHand(game, "Peregrination");
    const before = hand(game).length;
    cast(game, card);
    const zones = [zone(game, f1), zone(game, f2)].sort();
    expect(zones).toEqual(["battlefield", "hand"]);
    const onField = zone(game, f1) === "battlefield" ? f1 : f2;
    expect(game.state.objects[onField].tapped).toBe(true);
    expect(hand(game).length).toBe(before); // the spell left, a Forest came
  });
});

describe("Glimpse the Sun God", () => {
  it("taps X target creatures", () => {
    const { game } = table();
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Glimpse the Sun God"), { x: 2, targets: [ref(b1), ref(b2)] });
    expect(game.state.objects[b1].tapped).toBe(true);
    expect(game.state.objects[b2].tapped).toBe(true);
  });
});

describe("Graverobber Spider", () => {
  it("gets +X/+X for creature cards in its controller's graveyard, once each turn", () => {
    const { game } = table();
    const spider = spawn(game, "Graverobber Spider");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 8);
    activate(game, spider);
    expect(pt(game, spider)).toEqual({ power: 4, toughness: 6 });
    expect(() => activate(game, spider)).toThrow();
  });
});

describe("Sanguimancy", () => {
  it("draws and loses life equal to devotion to black", () => {
    const { game } = table();
    spawn(game, "Gray Merchant of Asphodel"); // {3}{B}{B}
    spawn(game, "Grizzly Bears"); // no black
    lands(game, "Swamp", 5);
    const card = toHand(game, "Sanguimancy");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game)).toBe(18);
  });
});

describe("Stratus Walk", () => {
  it("draws a card, and the enchanted creature can block only fliers", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const card = toHand(game, "Stratus Walk");
    pickTargets(a, bears);
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before); // the Aura left, a card came
    const ground = spawn(game, "Hill Giant");
    const flier = spawn(game, "Wind Drake");
    const offer = blockOffer(game, a, [ground, flier]);
    const entry = offer.eligible.find((e) => e.blocker === bears);
    expect(entry?.canBlock).toContain(flier);
    expect(entry?.canBlock).not.toContain(ground);
  });
});

describe("Kragma Butcher", () => {
  it("gets +2/+0 when it becomes untapped", () => {
    const { game } = table();
    const butcher = spawn(game, "Kragma Butcher", A, { tapped: true });
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(butcher)]);
    settle(game);
    expect(pt(game, butcher)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Pheres-Band Tromper", () => {
  it("gets a +1/+1 counter when it untaps in the untap step", () => {
    const { game } = table();
    const tromper = spawn(game, "Pheres-Band Tromper", A, { tapped: true });
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, tromper)).toBe(1);
  });
});

describe("Felhide Brawler", () => {
  it("can block only while its controller controls another Minotaur", () => {
    const { game, a } = table();
    const brawler = spawn(game, "Felhide Brawler", B);
    spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    let offer = blockOffer(game, a, [attacker]);
    expect(offer.eligible.some((e) => e.blocker === brawler)).toBe(false);
    const { game: g2, a: a2 } = table();
    const brawler2 = spawn(g2, "Felhide Brawler", B);
    spawn(g2, "Kragma Butcher", B);
    const attacker2 = spawn(g2, "Grizzly Bears");
    offer = blockOffer(g2, a2, [attacker2]);
    expect(offer.eligible.some((e) => e.blocker === brawler2)).toBe(true);
  });
});

describe("Skyreaping", () => {
  it("deals damage equal to devotion to green to each creature with flying", () => {
    const { game } = table();
    spawn(game, "Pheres-Band Tromper"); // {3}{G}
    spawn(game, "Graverobber Spider"); // {3}{G}
    const drake = spawn(game, "Wind Drake", B); // 2/2 flier
    const big = spawn(game, "Serra Angel", B); // 4/4 flier
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Skyreaping"));
    expect(zone(game, drake)).toBe("graveyard");
    expect(game.state.objects[big].damageMarked).toBe(2);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Siren Song Lyre", () => {
  it("gives the equipped creature {2}, {T}: Tap target creature", () => {
    const { game } = table();
    const lyre = spawn(game, "Siren Song Lyre");
    const holder = spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 4);
    activate(game, lyre, 0, { targets: [ref(holder)] });
    activate(game, holder, 0, { targets: [ref(victim)] });
    expect(game.state.objects[victim].tapped).toBe(true);
    expect(game.state.objects[holder].tapped).toBe(true);
  });
});

describe("Pillar of War", () => {
  it("can attack only while enchanted", () => {
    const { game } = table();
    const pillar = spawn(game, "Pillar of War");
    expect(attackEligible(game)).not.toContain(pillar);

    const { game: g2, a: a2 } = table();
    const pillar2 = spawn(g2, "Pillar of War");
    lands(g2, "Island", 2);
    pickTargets(a2, pillar2);
    cast(g2, toHand(g2, "Stratus Walk"), { targets: [ref(pillar2)] });
    expect(attackEligible(g2)).toContain(pillar2);
  });
});

describe("Sunbond", () => {
  it("puts that many +1/+1 counters on the enchanted creature when its controller gains life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    pickTargets(a, bears);
    cast(game, toHand(game, "Sunbond"), { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(counters(game, bears)).toBe(3);
  });
});
