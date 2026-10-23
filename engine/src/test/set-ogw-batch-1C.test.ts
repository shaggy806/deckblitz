import { describe, expect, it } from "vitest";

import {
  A,
  B,
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
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// OGW / C15 group C: the clauses most likely to be wrong — surge with an {X},
// a ward-shaped trigger for spells only, the whole hand to the bottom, damage
// gating the riders, the support-then-untap order, ravenous, and the rest.

describe("Fall of the Titans", () => {
  it("surge {X}{R} pays one X, and deals X to each of two targets", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const maw = spawn(game, "Colossal Dreadmaw", B);
    // Four Mountains left: {X}{R} with X = 3, where {X}{X}{R} would need 7.
    cast(game, toHand(game, "Fall of the Titans"), { targets: [ref(maw), ref(B)], x: 3, altCost: true });
    expect(game.state.objects[maw].damageMarked).toBe(3);
    expect(life(game, B)).toBe(17);
  });
});

describe("Reality Smasher", () => {
  it("an opponent's spell targeting it is countered unless they discard a card", () => {
    const { game, a } = table();
    const smasher = spawn(game, "Reality Smasher", B);
    lands(game, "Mountain", 1);
    pickModes(a); // decline to discard
    const shock = toHand(game, "Shock");
    const before = hand(game, A).length;
    cast(game, shock, { targets: [ref(smasher)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[smasher].damageMarked).toBe(0);
    expect(hand(game, A).length).toBe(before - 1);
  });

  it("paying the discard lets the spell resolve", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const smasher = spawn(game, "Reality Smasher", B);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const before = hand(game, A).length;
    cast(game, shock, { targets: [ref(smasher)] });
    expect(game.state.objects[smasher].damageMarked).toBe(2);
    expect(hand(game, A).length).toBe(before - 2);
  });

  it("its controller's own spell doesn't trigger it", () => {
    const { game } = table();
    const smasher = spawn(game, "Reality Smasher", A);
    lands(game, "Mountain", 1);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(smasher)] });
    expect(game.state.objects[smasher].damageMarked).toBe(2);
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Arjun, the Shifting Flame", () => {
  it("puts the whole hand on the bottom and draws that many", () => {
    const { game } = table();
    spawn(game, "Arjun, the Shifting Flame", A);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const old = hand(game, A).filter((id) => id !== shock);
    cast(game, shock, { targets: [ref(B)] });
    expect(hand(game, A)).toHaveLength(old.length);
    expect(hand(game, A).some((id) => old.includes(id))).toBe(false);
    expect(old.every((id) => zone(game, id) === "library")).toBe(true);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-old.length).every((id) => old.includes(id))).toBe(true);
  });
});

describe("Burn from Within", () => {
  it("a damaged creature loses indestructible and is exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const myr = spawn(game, "Darksteel Myr", B);
    cast(game, toHand(game, "Burn from Within"), { targets: [ref(myr)], x: 1 });
    expect(zone(game, myr)).toBe("exile");
  });

  it("with X = 0 nothing is dealt, so neither rider applies", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const myr = spawn(game, "Darksteel Myr", B);
    cast(game, toHand(game, "Burn from Within"), { targets: [ref(myr)], x: 0 });
    expect(keywords(game, myr).has("indestructible")).toBe(true);
    destroy(game, myr);
    expect(zone(game, myr)).toBe("battlefield");
  });

  it("can hit a player", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Burn from Within"), { targets: [ref(B)], x: 3 });
    expect(life(game, B)).toBe(17);
  });
});

describe("Unity of Purpose", () => {
  it("supports first, then untaps each creature you control with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const plain = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Unity of Purpose"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[plain].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Mawloc", () => {
  it("X = 5: enters with five counters, draws, and the creature it fights is exiled", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    lands(game, "Forest", 1);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, maw);
    const mawloc = toHand(game, "Mawloc");
    const before = hand(game, A).length;
    cast(game, mawloc, { x: 5 });
    expect(counters(game, mawloc)).toBe(5);
    expect(hand(game, A).length).toBe(before); // cast one, drew one
    expect(zone(game, maw)).toBe("exile");
    expect(pt(game, mawloc)).toEqual({ power: 7, toughness: 7 });
  });

  it("X = 4: no card", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 1);
    pickTargets(a, null);
    const mawloc = toHand(game, "Mawloc");
    const before = hand(game, A).length;
    cast(game, mawloc, { x: 4 });
    expect(counters(game, mawloc)).toBe(4);
    expect(hand(game, A).length).toBe(before - 1);
  });
});

describe("Bloodspore Thrinax", () => {
  it("each other creature you control enters with X more counters", () => {
    const { game } = table();
    const thrinax = spawn(game, "Bloodspore Thrinax", A);
    game.state.objects[thrinax].counters["+1/+1"] = 2;
    const bears = enter(game, "Grizzly Bears", A);
    expect(counters(game, bears)).toBe(2);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Sky Scourer and Eldrazi Aggressor", () => {
  it("Sky Scourer: +1/+0 for a colorless spell only", () => {
    const { game } = table();
    const scourer = spawn(game, "Sky Scourer", A);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, scourer).power).toBe(1);
    cast(game, toHand(game, "Sol Ring"));
    expect(pt(game, scourer).power).toBe(2);
  });

  it("Eldrazi Aggressor: haste only beside another colorless creature", () => {
    const { game } = table();
    const aggressor = spawn(game, "Eldrazi Aggressor", A);
    expect(keywords(game, aggressor).has("haste")).toBe(false);
    spawn(game, "Grizzly Bears", A);
    expect(keywords(game, aggressor).has("haste")).toBe(false);
    spawn(game, "Ornithopter", A);
    expect(keywords(game, aggressor).has("haste")).toBe(true);
  });
});

describe("Abstruse Interference", () => {
  it("makes the Scion even when the {1} is paid", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    lands(game, "Island", 4);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Abstruse Interference"), { targets: [ref(shock)] });
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });

  it("and when it isn't", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 3);
    pickModes(a);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Abstruse Interference"), { targets: [ref(shock)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, shock)).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});

describe("Betrayer's Bargain", () => {
  it("an enchantment can pay the additional cost", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const anthem = spawn(game, "Glorious Anthem", A);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    const spell = toHand(game, "Betrayer's Bargain");
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "cast-spell" && x.card === spell && x.costOptionText === "Sacrifice a creature or enchantment");
    expect(offer?.kind).toBe("cast-spell");
    cast(game, spell, {
      targets: [ref(maw)],
      costOption: offer?.kind === "cast-spell" ? offer.costOption : undefined,
      sacrifice: anthem,
    });
    expect(graveyard(game, A)).toContain(anthem);
    expect(game.state.objects[maw].damageMarked).toBe(5);
    destroy(game, maw);
    expect(zone(game, maw)).toBe("exile");
  });
});
