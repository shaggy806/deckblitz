/**
 * Weatherlight (WTH; B175), group D. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Teferi's Veil", () => {
  it("phases the attacker out after combat damage, and it phases back in at your next untap step", () => {
    const { game, a } = table();
    spawn(game, "Teferi's Veil");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bears].phasedOut).toBeDefined();
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].phasedOut).toBeUndefined();
  });
});

describe("Aether Flash", () => {
  it("deals 2 damage to any creature that enters, an opponent's too", () => {
    const { game } = table();
    spawn(game, "Aether Flash");
    const bears = enter(game, "Grizzly Bears", B);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Llanowar Druid", () => {
  it("untaps every Forest, an opponent's included", () => {
    const { game } = table();
    const druid = spawn(game, "Llanowar Druid");
    const theirs = spawn(game, "Forest", B, { tapped: true });
    const mine = spawn(game, "Forest", A, { tapped: true });
    activate(game, druid, 0);
    expect(zone(game, druid)).toBe("graveyard");
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Bubble Matrix", () => {
  it("prevents damage to every creature, but not to players", () => {
    const { game } = table();
    spawn(game, "Bubble Matrix");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(B)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });
});

describe("Call of the Wild", () => {
  it("puts a revealed creature card onto the battlefield and a noncreature card into the graveyard", () => {
    const { game, a } = table();
    const call = spawn(game, "Call of the Wild");
    lands(game, "Forest", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, call, 0);
    expect(zone(game, bears)).toBe("battlefield");
    const top = toLibrary(game, "Island");
    pickFromZone(a);
    lands(game, "Forest", 4);
    activate(game, call, 0);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Festering Evil", () => {
  it("sacrificed, deals 3 damage to each creature and each player", () => {
    const { game } = table();
    const evil = spawn(game, "Festering Evil");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    activate(game, evil, 0);
    expect(zone(game, evil)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Fatal Blow", () => {
  it("destroys a creature dealt damage this turn and can't target one that wasn't", () => {
    const { game } = table();
    const hurt = spawn(game, "Craw Wurm", B);
    const fresh = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(hurt)] });
    expect(zone(game, hurt)).toBe("battlefield");
    lands(game, "Swamp", 2);
    expect(() => cast(game, toHand(game, "Fatal Blow"), { targets: [ref(fresh)] })).toThrow();
    cast(game, toHand(game, "Fatal Blow"), { targets: [ref(hurt)] });
    expect(zone(game, hurt)).toBe("graveyard");
  });
});

describe("Gerrard's Wisdom", () => {
  it("gains 2 life for each card left in hand", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const wisdom = toHand(game, "Gerrard's Wisdom");
    const others = hand(game).length - 1;
    cast(game, wisdom);
    expect(life(game, A)).toBe(20 + 2 * others);
  });
});

describe("Xanthic Statue", () => {
  it("becomes an 8/8 Golem artifact creature with trample", () => {
    const { game } = table();
    const statue = spawn(game, "Xanthic Statue");
    lands(game, "Wastes", 5);
    activate(game, statue, 0);
    expect(pt(game, statue)).toEqual({ power: 8, toughness: 8 });
    expect(types(game, statue)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, statue).has("trample")).toBe(true);
  });
});

describe("Fungus Elemental", () => {
  it("grows with a +2/+2 counter for a sacrificed Forest the turn it entered, and not after", () => {
    const { game } = table();
    const fungus = enter(game, "Fungus Elemental");
    const fodder = spawn(game, "Forest");
    lands(game, "Forest", 1);
    toStep(game, "precombat-main");
    // A new turn: it didn't enter this one, so the ability isn't offered.
    const later = { type: "activate-ability", player: A, source: fungus, abilityIndex: 0, targets: [], sacrifice: fodder } as const;
    expect(game.canDispatch(later)).not.toBeNull();
    const fresh = enter(game, "Fungus Elemental");
    game.dispatch({ ...later, source: fresh });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, fresh)).toEqual({ power: 5, toughness: 5 });
  });
});
