/**
 * Set walk batch 77, part c (2026-10-15): the end of Teenage Mutant Ninja Turtles (TMT) and the
 * rest of Lorwyn Eclipsed Commander (ECC). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

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
  named,
  pickModes,
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
  watchTargets,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}
/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
function activateSacrificing(game: Game, source: ObjectId, index: number, sacrifice: ObjectId): void {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice });
  settle(game);
}

describe("Bebop, Warthog Warrior", () => {
  it("has menace and gives the Rhinos you control menace, not an opponent's", () => {
    const { game } = table();
    const bebop = spawn(game, "Bebop, Warthog Warrior");
    const rhinos = spawn(game, "Crash of Rhinos");
    const theirs = spawn(game, "Crash of Rhinos", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bebop).has("menace")).toBe(true);
    expect(keywords(game, rhinos).has("menace")).toBe(true);
    expect(keywords(game, theirs).has("menace")).toBe(false);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Purple Dragon Punks", () => {
  it("its red pays for an artifact spell or an ability, not a non-artifact spell", () => {
    const { game } = table();
    const punks = spawn(game, "Purple Dragon Punks");
    activate(game, punks, 0);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] })).toThrow();
    cast(game, toHand(game, "Sol Ring"));
    expect(named(game, "Sol Ring")).toHaveLength(1);
  });

  it("pays for an activated ability", () => {
    const { game } = table();
    const punks = spawn(game, "Purple Dragon Punks");
    const metalhead = spawn(game, "Metalhead");
    const ring = spawn(game, "Sol Ring");
    activate(game, punks, 0);
    activateSacrificing(game, metalhead, 0, ring);
    expect(counters(game, metalhead)).toBe(1);
  });
});

describe("Wingnut, Bat on the Belfry", () => {
  it("gains the chosen keyword when another creature you control enters", () => {
    const { game, a } = table();
    const wingnut = spawn(game, "Wingnut, Bat on the Belfry");
    pickModes(a, 1);
    enter(game, "Grizzly Bears");
    expect(keywords(game, wingnut).has("menace")).toBe(true);
    expect(keywords(game, wingnut).has("flying")).toBe(false);
    expect(keywords(game, wingnut).has("haste")).toBe(false);
  });

  it("an opponent's creature entering doesn't trigger it", () => {
    const { game, a } = table();
    const wingnut = spawn(game, "Wingnut, Bat on the Belfry");
    pickModes(a, 0);
    enter(game, "Grizzly Bears", B);
    expect(keywords(game, wingnut).has("flying")).toBe(false);
  });

  it("each other attacking creature gets +1/+0, Wingnut doesn't", () => {
    const { game, a } = table();
    const wingnut = spawn(game, "Wingnut, Bat on the Belfry");
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Hill Giant");
    attack(game, a, [wingnut, bears]);
    // 1 from Wingnut, 3 from the pumped Bears.
    expect(life(game, B)).toBe(16);
    expect(pt(game, home)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Utrom Scientists", () => {
  it("taps up to one target creature and puts a stun counter on it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Utrom Scientists");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });

  it("may choose no target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Utrom Scientists");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Tunnel Rats", () => {
  it("returns from your graveyard to the battlefield tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const rats = toGraveyard(game, "Tunnel Rats");
    activate(game, rats, 0);
    const [back] = named(game, "Tunnel Rats");
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Metalhead", () => {
  it("returns up to one other target artifact or creature to its owner's hand", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Forest", B);
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Metalhead");
    const [metalhead] = named(game, "Metalhead");
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(metalhead);
    expect(seen.offered[0]).toHaveLength(2);
    expect(hand(game, B)).toContain(ring);
  });

  it("sacrifices another artifact for a +1/+1 counter, menace and haste", () => {
    const { game } = table();
    const metalhead = spawn(game, "Metalhead", A, { sick: true });
    const ring = spawn(game, "Sol Ring");
    lands(game, "Mountain", 1);
    activateSacrificing(game, metalhead, 0, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, metalhead)).toBe(1);
    expect(keywords(game, metalhead).has("menace")).toBe(true);
    expect(keywords(game, metalhead).has("haste")).toBe(true);
    // Not itself: "another artifact".
    lands(game, "Mountain", 1);
    expect(() => activateSacrificing(game, metalhead, 0, metalhead)).toThrow();
  });
});

describe("Rock Soldiers", () => {
  it("destroys up to one target noncreature artifact", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Rock Soldiers");
    expect(seen.offered[0]).toEqual([ring]);
    expect(seen.offered[0]).not.toContain(thopter);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Old Hob, Alleycat Blues", () => {
  it("makes a hasty Mutant at the beginning of combat and destroys it at the next end step", () => {
    const { game } = table();
    spawn(game, "Old Hob, Alleycat Blues");
    const older = makeToken(game, "Mutant Token");
    toStep(game, "begin-combat");
    settle(game);
    const fresh = named(game, "Mutant Token").filter((id) => id !== older);
    expect(fresh).toHaveLength(1);
    expect(keywords(game, fresh[0]).has("haste")).toBe(true);
    expect(keywords(game, older).has("haste")).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Mutant Token")).toEqual([older]);
  });

  it("an attacking token given indestructible survives, and isn't destroyed later", () => {
    const { game, a } = table();
    const hob = spawn(game, "Old Hob, Alleycat Blues");
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => named(game, "Mutant Token").map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    const [mutant] = named(game, "Mutant Token");
    expect(() => activate(game, hob, 0, { targets: [ref(hob)] })).toThrow();
    activate(game, hob, 0, { targets: [ref(mutant)] });
    expect(keywords(game, mutant).has("indestructible")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, mutant)).toBe("battlefield");
    toStep(game, "upkeep", B);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, mutant)).toBe("battlefield");
  });
});

describe("High-Flying Ace", () => {
  it("gives a creature without flying flying, as a sorcery", () => {
    const { game } = table();
    const ace = spawn(game, "High-Flying Ace");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    lands(game, "Plains", 8);
    expect(() => activate(game, ace, 0, { targets: [ref(angel)] })).toThrow();
    activate(game, ace, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("General Traag, Heart of Stone", () => {
  it("may sacrifice another artifact; when it does, deals 4 damage to target creature", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const thopter = spawn(game, "Ornithopter");
    const giant = spawn(game, "Hill Giant", B);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [ring];
    };
    pickModes(a, 0);
    pickTargets(a, giant);
    enter(game, "General Traag, Heart of Stone");
    const [traag] = named(game, "General Traag, Heart of Stone");
    expect([...offered].sort()).toEqual([ring, thopter].sort());
    expect(offered).not.toContain(traag);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("declining the sacrifice deals no damage", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    a.chooseSacrificesFn = () => [];
    enter(game, "General Traag, Heart of Stone");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Nobody", () => {
  it("returns another artifact you control to hand, then scries 1", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Nobody");
    expect(seen.offered[0]).toEqual([ring]);
    expect(hand(game)).toContain(ring);
    expect(scries).toBe(1);
  });

  it("with no target chosen, still scries", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    pickTargets(a, null);
    enter(game, "Nobody");
    expect(zone(game, ring)).toBe("battlefield");
    expect(scries).toBe(1);
  });

  it("with its target gone, doesn't resolve and doesn't scry (the ruling)", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    pickTargets(a, ring);
    enter(game, "Nobody", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(scries).toBe(0);
  });
});

describe("Mouser Mark III", () => {
  it("can't attack unless you control another artifact", () => {
    const { game } = table();
    const mouser = spawn(game, "Mouser Mark III");
    expect(game.characteristics(mouser).restrictions).toContain("cant-attack");
    spawn(game, "Sol Ring", B);
    expect(game.characteristics(mouser).restrictions).toContain("cant-attack");
    spawn(game, "Sol Ring");
    expect(game.characteristics(mouser).restrictions).not.toContain("cant-attack");
  });
});

describe("Belonging", () => {
  it("makes three changeling Shapeshifters as it enters", () => {
    const { game } = table();
    enter(game, "Belonging");
    expect(tokensNamed(game, "Shapeshifter Token", A)).toBe(3);
  });

  it("encore makes a hasty token copy for each opponent, each with its own Shapeshifters", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 8);
    const card = toGraveyard(game, "Belonging");
    activate(game, card, 0);
    expect(zone(game, card)).toBe("exile");
    const copies = named(game, "Belonging");
    expect(copies).toHaveLength(2);
    expect(copies.every((id) => game.state.objects[id].isToken)).toBe(true);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(tokensNamed(game, "Shapeshifter Token", A)).toBe(6);
  });
});

describe("Puca's Covenant", () => {
  it("returns another permanent card with mana value up to the dead creature's counters, once a turn", () => {
    const { game, a } = table();
    spawn(game, "Puca's Covenant");
    const ring = toGraveyard(game, "Sol Ring");
    const thopter = toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1, stun: 1 };
    pickModes(a, 0);
    const seen = watchTargets(a, () => [ring]);
    destroy(game, bears);
    // Two counters of two kinds: mana value 2 or less, a permanent card, not the Bears itself.
    expect([...seen.offered[0]].sort()).toEqual([ring, thopter].sort());
    expect(hand(game)).toContain(ring);
    // A second death this turn returns nothing.
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[other].counters = { "+1/+1": 2 };
    watchTargets(a, () => [thopter]);
    destroy(game, other);
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("a creature with no counters doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Puca's Covenant");
    const thopter = toGraveyard(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, bears);
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Wickersmith's Tools", () => {
  it("counts -1/-1 counters put on any creature, then makes that many tapped Scarecrows", () => {
    const { game } = table();
    const tools = spawn(game, "Wickersmith's Tools");
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, tools, "charge")).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(mine)]);
    settle(game);
    // +1/+1 counters don't count.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mine)]);
    settle(game);
    expect(counters(game, tools, "charge")).toBe(2);
    lands(game, "Wastes", 5);
    activate(game, tools, 1);
    expect(zone(game, tools)).toBe("graveyard");
    const scarecrows = named(game, "Scarecrow Token");
    expect(tokensNamed(game, "Scarecrow Token", A)).toBe(2);
    expect(scarecrows.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pt(game, scarecrows[0])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Elemental Spectacle", () => {
  it("makes a 5/5 per color among your permanents, then gains life per creature you control", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    spawn(game, "Grizzly Bears");
    spawn(game, "Raging Goblin");
    spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Elemental Spectacle"));
    expect(tokensNamed(game, "5/5 Elemental Token", A)).toBe(2);
    // Bears, Goblin and the two Elementals.
    expect(life(game)).toBe(24);
  });
});
