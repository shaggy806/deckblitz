/**
 * Kaladesh / Commander 2016, group C: the clause of each card most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
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
  types,
  zone,
} from "./harness.js";

describe("Ancient Excavation", () => {
  it("draws as many cards as are in hand, not counting itself, then discards that many", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const spell = toHand(game, "Ancient Excavation");
    const before = hand(game).length - 1;
    const yard = graveyard(game).length;
    cast(game, spell);
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(yard + before + 1);
  });
});

describe("Frenzied Fugue", () => {
  it("steals, untaps and hastes the enchanted permanent as it enters, and again on your upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Frenzied Fugue"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(controller(game, bears)).toBe(B);
    toStep(game, "precombat-main", A);
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Charging Cinderhorn", () => {
  it("with no attacks, gets a fury counter and hits the player whose end step it is", () => {
    const { game } = table();
    const ox = spawn(game, "Charging Cinderhorn");
    game.advanceUntil((s) => s.turn.number === 2);
    expect(counters(game, ox, "fury")).toBe(1);
    expect(life(game, A)).toBe(19);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(counters(game, ox, "fury")).toBe(2);
    expect(life(game, B)).toBe(18);
  });

  it("doesn't trigger at all on a turn a creature attacked", () => {
    const { game, a } = table();
    const ox = spawn(game, "Charging Cinderhorn");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(counters(game, ox, "fury")).toBe(0);
    expect(life(game, A)).toBe(20);
  });
});

describe("Confiscation Coup", () => {
  it("pays energy equal to the mana value to take the creature", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Confiscation Coup"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.players[A].energy).toBe(2);
  });

  it("can't pay more energy than it has: a 5-mana-value creature stays put", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const big = spawn(game, "Chandra's Firemaw", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Confiscation Coup"), { targets: [ref(big)] });
    expect(controller(game, big)).toBe(B);
    expect(game.state.players[A].energy).toBe(4);
  });
});

describe("Depala, Pilot Exemplar", () => {
  it("pumps other Dwarves, and a Vehicle only while it's a creature", () => {
    const { game } = table();
    const depala = spawn(game, "Depala, Pilot Exemplar");
    const dwarf = spawn(game, "Consul's Shieldguard");
    const cruiser = spawn(game, "Fleetwheel Cruiser");
    expect(pt(game, depala)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, dwarf)).toEqual({ power: 4, toughness: 5 });
    expect(types(game, cruiser)).not.toContain("creature");
    game.debugApplyEffect(
      A,
      { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      [ref(cruiser)],
    );
    expect(pt(game, cruiser)).toEqual({ power: 6, toughness: 4 });
  });

  it("becoming tapped, pays X to take every Dwarf and Vehicle among the top X", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const depala = spawn(game, "Depala, Pilot Exemplar");
    const dwarf = toLibrary(game, "Consul's Shieldguard");
    toLibrary(game, "Wastes");
    const vehicle = toLibrary(game, "Fleetwheel Cruiser");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(depala)]);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    settle(game);
    expect(zone(game, dwarf)).toBe("hand");
    expect(zone(game, vehicle)).toBe("hand");
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Fleetwheel Cruiser", () => {
  it("is an artifact creature the turn it enters", () => {
    const { game } = table();
    const cruiser = enter(game, "Fleetwheel Cruiser");
    expect(types(game, cruiser)).toContain("creature");
    toStep(game, "precombat-main", B);
    expect(types(game, cruiser)).not.toContain("creature");
  });
});

describe("Welding Sparks", () => {
  it("deals 3 plus the number of artifacts you control", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    const ox = spawn(game, "Charging Cinderhorn", B);
    game.state.objects[ox].counters["+1/+1"] = 2;
    cast(game, toHand(game, "Welding Sparks"), { targets: [ref(ox)] });
    expect(zone(game, ox)).toBe("graveyard");
  });
});

describe("Scrapheap Scrounger", () => {
  it("returns from the graveyard by exiling another creature card, never itself", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const scrounger = toGraveyard(game, "Scrapheap Scrounger");
    expect(() => activate(game, scrounger, 0)).toThrow();
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, scrounger, 0);
    expect(zone(game, scrounger)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Minister of Inquiries", () => {
  it("enters with two energy; {T}, pay {E}: target player mills three", () => {
    const { game } = table();
    const minister = enter(game, "Minister of Inquiries");
    expect(game.state.players[A].energy).toBe(2);
    activate(game, minister, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(3);
    expect(game.state.players[A].energy).toBe(1);
  });
});

describe("Spireside Infiltrator", () => {
  it("becoming tapped by attacking deals 1 damage to each opponent", () => {
    const { game, a } = table();
    const rogue = spawn(game, "Spireside Infiltrator");
    attack(game, a, [rogue]);
    expect(life(game, B)).toBe(20 - 1 - 3);
  });
});

describe("Consul's Shieldguard", () => {
  it("pays {E} on attack to make another attacker indestructible", () => {
    const { game, a } = table();
    const guard = enter(game, "Consul's Shieldguard");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    a.declareAttackersFn = () => [guard, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(game.state.players[A].energy).toBe(1);
  });
});

describe("Furious Reprisal", () => {
  it("deals 2 damage to each of two different targets", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Furious Reprisal"), { targets: [ref(bears), ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Take Down", () => {
  it("the second mode deals 1 damage to each creature with flying, and only those", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const crane = spawn(game, "Glint-Nest Crane", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Take Down"), { modes: [1] });
    expect(game.state.objects[crane].damageMarked).toBe(1);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Glint-Nest Crane", () => {
  it("may take an artifact card from the top four", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    enter(game, "Glint-Nest Crane");
    expect(zone(game, ring)).toBe("hand");
  });
});
