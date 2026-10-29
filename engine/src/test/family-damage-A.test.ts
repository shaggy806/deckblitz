/**
 * Batch B250, group A — cards freed by the damage-modification family
 * (rules 614.9, 615): one-shot damage rules (Inkshield, Acolyte's Reward,
 * Vengeful Archon, Festival of the Guildpact, Endure, Safe Passage, Repel the
 * Abominable, Luminesce, Kor Dirge, Ultimate Magic: Holy, Summon: Alexander),
 * static replacements (The Wanderer, Martyrs of Korlis, Daunting Defender,
 * Shield of the Realm) and damage that can't be prevented (Questing Beast,
 * Wild Slash, Leyline of Punishment).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const attach = (game: Game, equipment: ObjectId, to: ObjectId): void => {
  game.state.objects[equipment].attachedTo = to;
};

describe("one-shot damage rules", () => {
  it("Inkshield prevents the combat damage to you and makes an Inkling for each 1 prevented", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: A },
      { attacker: goblin, defender: A },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, toHand(game, "Inkshield"));
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Inkling Token", A)).toBe(3);
  });

  it("Acolyte's Reward prevents the next devotion-to-white damage and deals that much to the second target", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Serra Angel"); // {3}{W}{W}: devotion 2
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Acolyte's Reward"), { targets: [ref(bears), ref(B)] });
    hit(game, goblin, ref(bears), 3);
    expect(damage(game, bears)).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("Vengeful Archon prevents the next X damage to you and deals what it prevented to its target", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const archon = spawn(game, "Vengeful Archon");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, archon, 0, { x: 2, targets: [ref(B)] });
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });

  it("Festival of the Guildpact prevents the next X damage to you and draws a card", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    const festival = toHand(game, "Festival of the Guildpact");
    const before = hand(game).length;
    cast(game, festival, { x: 2 });
    expect(hand(game).length).toBe(before);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(19);
  });

  it("Endure covers your planeswalkers; Safe Passage only you and your creatures", () => {
    const one = table().game;
    lands(one, "Plains", 5);
    const dovin = spawn(one, "Dovin, Hand of Control");
    const goblin = spawn(one, "Raging Goblin", B);
    cast(one, toHand(one, "Endure"));
    hit(one, goblin, ref(A), 2);
    hit(one, goblin, ref(dovin), 2);
    expect(life(one, A)).toBe(20);
    expect(counters(one, dovin, "loyalty")).toBe(5);

    const two = table().game;
    lands(two, "Plains", 3);
    const walker = spawn(two, "Dovin, Hand of Control");
    const bears = spawn(two, "Grizzly Bears");
    const theirs = spawn(two, "Raging Goblin", B);
    cast(two, toHand(two, "Safe Passage"));
    hit(two, theirs, ref(A), 2);
    hit(two, theirs, ref(bears), 1);
    // A creature arriving later is covered too.
    const later = spawn(two, "Grizzly Bears");
    hit(two, theirs, ref(later), 1);
    hit(two, theirs, ref(walker), 2);
    expect(life(two, A)).toBe(20);
    expect(damage(two, bears) + damage(two, later)).toBe(0);
    expect(counters(two, walker, "loyalty")).toBe(3);
  });

  it("Repel the Abominable stops non-Human sources only", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    const human = spawn(game, "Elite Vanguard", B);
    cast(game, toHand(game, "Repel the Abominable"));
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    hit(game, human, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("Luminesce stops red and black sources, not green ones", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Luminesce"));
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(20);
    hit(game, bears, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("Kor Dirge sends the chosen source's damage to your creature to the other target, and refuses the same creature twice", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const dirge = toHand(game, "Kor Dirge");
    expect(() => cast(game, dirge, { targets: [ref(bears), ref(bears)] })).toThrow();
    pickPermanents(a, goblin);
    cast(game, dirge, { targets: [ref(bears), ref(wall)] });
    hit(game, goblin, ref(bears), 1);
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, wall)).toBe(3);
  });

  it("Ultimate Magic: Holy cast from hand grants indestructible but prevents nothing", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Ultimate Magic: Holy"));
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("Ultimate Magic: Holy cast foretold, from exile, also prevents all damage to you", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    const holy = toHand(game, "Ultimate Magic: Holy");
    game.dispatch({ type: "foretell", player: A, card: holy });
    expect(zone(game, holy)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    cast(game, holy, { via: "foretell" });
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(20);
  });

  it("Crystal Fragments transforms into Summon: Alexander, whose chapter I shields your creatures", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const fragments = spawn(game, "Crystal Fragments");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, fragments, 0);
    settle(game);
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, bears)).toBe(0);
    // Players aren't covered.
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("static replacements", () => {
  it("The Wanderer prevents noncombat damage to you and your other permanents, not to itself", () => {
    const { game } = table();
    const wanderer = spawn(game, "The Wanderer");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    hit(game, goblin, ref(bears), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, bears)).toBe(0);
    hit(game, goblin, ref(wanderer), 2);
    expect(counters(game, wanderer, "loyalty")).toBe(3);
  });

  it("Martyrs of Korlis takes artifact damage to you while untapped, and only artifact damage", () => {
    const { game } = table();
    const martyrs = spawn(game, "Martyrs of Korlis");
    const thopter = spawn(game, "Ornithopter", B);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, thopter, ref(A), 2);
    expect(life(game, A)).toBe(20);
    expect(damage(game, martyrs)).toBe(2);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
    game.state.objects[martyrs].tapped = true;
    hit(game, thopter, ref(A), 1);
    expect(life(game, A)).toBe(18);
  });

  it("Daunting Defender prevents 1 of damage to a Cleric you control, not to another creature", () => {
    const { game } = table();
    const defender = spawn(game, "Daunting Defender");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(defender), 2);
    expect(damage(game, defender)).toBe(1);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });

  it("Shield of the Realm prevents 2 of each source's damage to the equipped creature", () => {
    const { game } = table();
    const shield = spawn(game, "Shield of the Realm");
    const wall = spawn(game, "Wall of Stone");
    attach(game, shield, wall);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(wall), 3);
    expect(damage(game, wall)).toBe(1);
  });
});

describe("damage that can't be prevented", () => {
  it("Questing Beast's combat damage goes through a Fog, then hits that player's planeswalker", () => {
    const { game, a } = table();
    const beast = spawn(game, "Questing Beast");
    const dovin = spawn(game, "Dovin, Hand of Control", B);
    game.debugApplyEffect(B, { kind: "prevent-all-combat-damage" }, []);
    pickTargets(a, dovin);
    attack(game, a, [beast], B);
    expect(life(game, B)).toBe(16);
    expect(counters(game, dovin, "loyalty")).toBe(1);
  });

  it("Wild Slash's ferocious makes its damage unpreventable only with a power-4 creature", () => {
    const one = table().game;
    lands(one, "Mountain", 1);
    spawn(one, "Serra Angel");
    const bears = spawn(one, "Grizzly Bears", B);
    one.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: 3 }, [ref(bears)]);
    cast(one, toHand(one, "Wild Slash"), { targets: [ref(bears)] });
    expect(zone(one, bears)).toBe("graveyard");

    const two = table().game;
    lands(two, "Mountain", 1);
    const other = spawn(two, "Grizzly Bears", B);
    two.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: 3 }, [ref(other)]);
    cast(two, toHand(two, "Wild Slash"), { targets: [ref(other)] });
    expect(zone(two, other)).toBe("battlefield");
    expect(damage(two, other)).toBe(0);
  });

  it("Leyline of Punishment stops life gain and prevention shields", () => {
    const { game } = table();
    spawn(game, "Leyline of Punishment", B);
    const goblin = spawn(game, "Raging Goblin", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    expect(life(game, A)).toBe(20);
    game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: 3 }, [ref(A)]);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Kiora, the Crashing Wave", () => {
  it("−5's emblem makes a 9/9 Kraken at each of your end steps", () => {
    const { game } = table();
    const kiora = spawn(game, "Kiora, the Crashing Wave");
    loyalty(game, kiora, -5, { atLeast: 5 });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Kraken Token (Spawning Kraken)", A)).toBe(1);
  });
});
