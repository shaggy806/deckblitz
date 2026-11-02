/**
 * More players an effect can name: a slot tied to a target player's permanents
 * (`sameController`, `sameObjectAllowed`, a group's `{ slot }`), the controller
 * of what an Aura's on (`"attached-controller"`, a `step-begins` `who:
 * "attached"` on a creature, `whose: "active-player"`), each opponent of the
 * trigger's player (`"opponents-of-trigger-controller"`), each player who can't
 * (`for-each-player`'s `before`), and who amasses (`amass`'s `who`).
 */
import { describe, expect, it } from "vitest";
import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

/** A creature planeswalker: Jace Beleren, made a 4/4 creature as well. */
function creatureWalker(game: Game, player: PlayerId): ReturnType<typeof spawn> {
  const id = spawn(game, "Jace Beleren", player);
  game.debugApplyEffect(
    player,
    {
      kind: "animate-all",
      filter: { name: "Jace Beleren" },
      power: 4,
      toughness: 4,
      addTypes: ["creature"],
      duration: "end-of-turn",
    },
    [],
  );
  return id;
}

describe("a slot tied to a target player", () => {
  it("The Fall of Kroog: a land that opponent controls, then that player and their creatures", () => {
    const { game } = table({ players: 3 });
    const land = spawn(game, "Wastes", B);
    const carols = spawn(game, "Wastes", C);
    const mine = spawn(game, "Grizzly Bears", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "The Fall of Kroog"), { targets: [ref(B), ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, carols)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[mine].damageMarked).toBe(0);
  });

  it("The Fall of Kroog refuses another player's land", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Wastes", B);
    const carols = spawn(game, "Wastes", C);
    lands(game, "Mountain", 6);
    expect(() => cast(game, toHand(game, "The Fall of Kroog"), { targets: [ref(B), ref(carols)] })).toThrow();
    expect(zone(game, carols)).toBe("battlefield");
  });

  it("Searing Blaze: a planeswalker's controller's creature, 1 each; 3 each after a land", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 4);
    const before = counters(game, walker, "loyalty");
    cast(game, toHand(game, "Searing Blaze"), { targets: [ref(walker), ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(counters(game, walker, "loyalty")).toBe(before - 1);

    enter(game, "Mountain", A);
    const ogre = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Searing Blaze"), { targets: [ref(B), ref(ogre)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, ogre)).toBe("graveyard"); // 3 damage on a 3/3
  });

  it("Searing Blaze: the word 'target' twice lets one creature planeswalker be both (rule 115.3)", () => {
    const { game } = table();
    const walker = creatureWalker(game, B);
    lands(game, "Mountain", 2);
    const before = counters(game, walker, "loyalty");
    cast(game, toHand(game, "Searing Blaze"), { targets: [ref(walker), ref(walker)] });
    // Dealt 1 as the player-or-planeswalker and 1 as the creature, at once.
    expect(game.state.objects[walker].damageMarked).toBe(2);
    expect(counters(game, walker, "loyalty")).toBe(before - 2);
  });

  it("Searing Blaze: a creature its slot's player doesn't control is refused", () => {
    const { game } = table({ players: 3 });
    const carols = spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Searing Blaze"), { targets: [ref(B), ref(carols)] })).toThrow();
  });

  it("another target with sameController still can't repeat its own slot (Mutiny's shape)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Mutiny"), { targets: [ref(bears), ref(bears)] })).toThrow();
  });

  it("Yosei: up to five of that player's permanents tapped, and they skip their next untap", () => {
    const { game, a } = table({ players: 3 });
    const yosei = spawn(game, "Yosei, the Morning Star", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirLand = spawn(game, "Wastes", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const seen = watchTargets(a, () => [B, theirs, theirLand]);
    destroy(game, yosei);
    expect(seen.asked).toBe(1);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[theirLand].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(false);
    nextTurn(game); // bob's, no untap step
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(false);
  });

  it("Mass Diminish: that player's creatures as it resolves, until your next turn", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant", A);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Mass Diminish"), { targets: [ref(B)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    const later = spawn(game, "Hill Giant", B);
    expect(pt(game, later)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game); // bob's
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game); // alice's
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Lavalanche: a planeswalker's controller's creatures, not the caster's", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant", A);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const before = counters(game, walker, "loyalty");
    cast(game, toHand(game, "Lavalanche"), { targets: [ref(walker)], x: 1 });
    expect(counters(game, walker, "loyalty")).toBe(before - 1);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(life(game, B)).toBe(20);
  });

  it("Ember Gale: white and blue creatures of that player damaged, none of theirs can block", () => {
    const { game } = table();
    const blue = spawn(game, "Coral Merfolk", B);
    const green = spawn(game, "Grizzly Bears", B);
    const mineBlue = spawn(game, "Coral Merfolk", A);
    const attacker = spawn(game, "Hill Giant", A);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Ember Gale"), { targets: [ref(B)] });
    expect(zone(game, blue)).toBe("graveyard"); // a 2/1
    expect(game.state.objects[green].damageMarked).toBe(0);
    expect(zone(game, mineBlue)).toBe("battlefield");
    // Binding what enters later too (rule 611.2c, the ruling).
    const late = spawn(game, "Grizzly Bears", B);
    expect(whyCannotBlock(game.state, registryOf(game), B, late, attacker)).not.toBeNull();
    expect(whyCannotBlock(game.state, registryOf(game), B, green, attacker)).not.toBeNull();
  });
});

describe('"attached-controller": the controller of what the source is on', () => {
  it("Gremlin Infestation deals its 2 to the artifact's controller, not the Aura's", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Gremlin Infestation"), { targets: [ref(stone)] });
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    destroy(game, stone);
    expect(named(game, "2/2 Gremlin Token", A).length).toBe(1);
  });

  it("gone together, it reads the host as it last existed (rule 608.2h)", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Gremlin Infestation"), { targets: [ref(stone)] });
    toStep(game, "end");
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } }, []);
    settle(game);
    expect(zone(game, stone)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("an Aura left behind first last existed attached to nothing, so it names nobody", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Gremlin Infestation"), { targets: [ref(stone)] });
    toStep(game, "end");
    destroy(game, stone);
    expect(life(game, B)).toBe(20);
  });

  it("Observed Stasis counts the tapped creatures of its host's controller, and shuts it down", () => {
    const { game } = table({ players: 3 });
    const host = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", C, { tapped: true });
    lands(game, "Island", 4);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Observed Stasis"), { targets: [ref(host)] });
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("Super Intelligence: that creature's controller's upkeep, and that player draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Super Intelligence"), { targets: [ref(bears)] });
    const mine = hand(game, A).length;
    const before = hand(game, B).length;
    nextTurn(game, "upkeep"); // bob's
    settle(game);
    expect(hand(game, B).length).toBe(before + 1);
    expect(hand(game, A).length).toBe(mine);
  });

  it("Citadel Siege taps only a creature the active opponent controls", () => {
    const { game, a } = table({ players: 3 });
    const siege = spawn(game, "Citadel Siege", A);
    game.state.objects[siege].chosenOnEnter = "Dragons";
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsOther = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears", A);
    const seen = watchTargets(a, () => [bobs]);
    nextTurn(game, "begin-combat"); // bob's
    settle(game);
    expect(seen.asked).toBe(1);
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([bobs, bobsOther].sort());
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe('"opponents-of-trigger-controller"', () => {
  it("Standstill: everyone but the caster draws three, its controller too when it's someone else's spell", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Standstill", B);
    const before = [A, B, C].map((p) => hand(game, p).length);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(C)] });
    expect(hand(game, A).length).toBe(before[0]);
    expect(hand(game, B).length).toBe(before[1] + 3);
    expect(hand(game, C).length).toBe(before[2] + 3);
    expect(named(game, "Standstill", B).length).toBe(0);
  });

  it("Heartwood Storyteller: each of the caster's opponents may draw, a noncreature spell only", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Heartwood Storyteller", B);
    pickModes(b, 0);
    pickModes(c);
    const before = [A, B, C].map((p) => hand(game, p).length);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(C)] });
    expect(hand(game, A).length).toBe(before[0]);
    expect(hand(game, B).length).toBe(before[1] + 1);
    expect(hand(game, C).length).toBe(before[2]);
    cast(game, toHand(game, "Goblin Piker"));
    expect(hand(game, B).length).toBe(before[1] + 1);
  });

  it("Bounty Board: the dying creature's controller's opponents draw and gain 2", () => {
    const { game } = table({ players: 3 });
    const board = spawn(game, "Bounty Board", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, board, 1, { targets: [ref(bears)] });
    expect(counters(game, bears, "bounty")).toBe(1);
    const before = [A, B, C].map((p) => hand(game, p).length);
    destroy(game, bears);
    expect(hand(game, A).length).toBe(before[0] + 1);
    expect(hand(game, B).length).toBe(before[1]);
    expect(hand(game, C).length).toBe(before[2] + 1);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(22);
  });
});

describe("for-each-player's `before`: each player who can't", () => {
  it("Cruel Grimnarch: one who discards their last card could; one with none couldn't", () => {
    const { game, b } = table({ players: 3 });
    // Their opening hands, out of the way.
    for (const p of [B, C]) for (const id of [...hand(game, p)]) game.state.objects[id].zone = "library";
    for (const p of [B, C]) game.state.zones.perPlayer[p].hand.length = 0;
    const last = toHand(game, "Wastes", B);
    pickFromZone(b, last);
    enter(game, "Cruel Grimnarch", A);
    expect(hand(game, B).length).toBe(0);
    expect(graveyard(game, B)).toContain(last);
    expect(life(game, A)).toBe(24); // carol couldn't, bob could
  });

  it("Plaguecrafter: sacrificing the last one isn't can't; the empty board discards", () => {
    const { game, a, b, c } = table({ players: 3 });
    for (const id of [...hand(game, C)]) game.state.objects[id].zone = "library";
    game.state.zones.perPlayer[C].hand.length = 0;
    const card = toHand(game, "Wastes", C);
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(b, bears);
    pickFromZone(c, card);
    void a;
    const handBefore = hand(game, B).length;
    enter(game, "Plaguecrafter", A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(named(game, "Plaguecrafter", A).length).toBe(0); // its own edict
    expect(hand(game, B).length).toBe(handBefore);
    expect(graveyard(game, C)).toContain(card);
  });
});

describe("amass by another player", () => {
  it("Azog: its controller amasses by its last power, and you draw only for your own", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    pickTargets(a, giant);
    enter(game, "Azog, Moria's Ruin", A);
    expect(zone(game, giant)).toBe("graveyard");
    const army = named(game, "Goblin Army Token", B);
    const armies = army.length > 0 ? army : named(game, "Army Token", B);
    expect(armies.length).toBe(1);
    expect(counters(game, armies[0])).toBe(3);
    expect(subtypes(game, armies[0])).toContain("Goblin");
    expect(hand(game, A).length).toBe(before);
    expect(named(game, "Army Token", A).length).toBe(0);
  });

  it("Azog: your own creature draws you a card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const before = hand(game, A).length;
    pickTargets(a, bears);
    enter(game, "Azog, Moria's Ruin", A);
    expect(hand(game, A).length).toBe(before + 1);
    expect(counters(game, named(game, "Army Token", A)[0])).toBe(2);
  });

  it("Azog: no target, nobody amasses (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", A);
    pickTargets(a, null);
    const before = hand(game, A).length;
    enter(game, "Azog, Moria's Ruin", A);
    expect(named(game, "Army Token", A).length).toBe(0);
    expect(named(game, "Army Token", B).length).toBe(0);
    expect(hand(game, A).length).toBe(before);
  });

  it("Azog: their choice among their own Armies, the counters on the one they chose", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const first = spawn(game, "Army Token", B);
    game.state.objects[first].counters["+1/+1"] = 1; // a 0/0 otherwise
    const second = spawn(game, "Mirror Entity", B); // a changeling is an Army
    const mine = spawn(game, "Mirror Entity", A);
    const asked = pickPermanents(b, second);
    pickTargets(a, giant);
    enter(game, "Azog, Moria's Ruin", A);
    expect(asked.offered).toContain(first);
    expect(asked.offered).not.toContain(mine);
    expect(counters(game, second)).toBe(3);
    expect(counters(game, first)).toBe(1);
  });
});

describe("a defending player's creatures", () => {
  it("Silumgar: -1/-1 on the creatures of the player attacked", () => {
    const { game, a } = table({ players: 3 });
    const silumgar = spawn(game, "Silumgar, the Drifting Death", A);
    const bears = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const mine = spawn(game, "Hill Giant", A);
    attack(game, a, [silumgar], B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, carols)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
  });
});

