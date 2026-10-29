/**
 * The damage-modification family (rules 614.9, 615): static redirections
 * (Palisade Giant, Pariah, Treacherous Link), damage replacements naming an
 * Aura's or Equipment's host (Muzzle), prevention of an amount — N, all but
 * N, half (Guardian Seraph, Hyperion, Gisela) — and halving (Ghosts of the
 * Innocent); damage that can't be prevented (615.12 — Excruciator, Flaring
 * Pain, Combust); and the one-shot `damage-rule` over source and recipient
 * scopes and durations (Kor Haven, Dovin, Eerie Interference, Turn the
 * Tables, Mirror Strike, Temper), with chosen-source shields reaching sets
 * and following up (Deflecting Palm, Kor Chant).
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
  destroy,
  lands,
  life,
  loyalty,
  nextTurn,
  pickPermanents,
  ref,
  spawn,
  table,
  toHand,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const attach = (game: Game, aura: ObjectId, to: ObjectId): void => {
  game.state.objects[aura].attachedTo = to;
};

describe("static redirection (rule 614.9)", () => {
  it("Palisade Giant takes the damage dealt to you and your other permanents, not its own twice", () => {
    const { game } = table();
    const giant = spawn(game, "Palisade Giant");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    hit(game, goblin, ref(bears), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, giant)).toBe(3);
    // Another player's damage is theirs.
    hit(game, goblin, ref(B), 1);
    expect(life(game, B)).toBe(19);
  });

  it("two Palisade Giants don't send damage back and forth (614.5)", () => {
    const { game } = table();
    const one = spawn(game, "Palisade Giant");
    const two = spawn(game, "Palisade Giant");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 4);
    expect(life(game, A)).toBe(20);
    expect(damage(game, one) + damage(game, two)).toBe(4);
  });

  it("Pariah sends damage to you to the enchanted creature; with it gone, you take it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const pariah = spawn(game, "Pariah");
    attach(game, pariah, bears);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, bears)).toBe(1);
    destroy(game, bears);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
  });

  it("Treacherous Link sends damage to the enchanted creature to its controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const link = spawn(game, "Treacherous Link");
    attach(game, link, bears);
    const goblin = spawn(game, "Raging Goblin");
    hit(game, goblin, ref(bears), 3);
    expect(damage(game, bears)).toBe(0);
    expect(life(game, B)).toBe(17);
  });
});

describe("damage replacements naming the host, amounts and halves", () => {
  it("Muzzle prevents all damage the enchanted creature would deal", () => {
    const { game } = table();
    const goblin = spawn(game, "Raging Goblin", B);
    const muzzle = spawn(game, "Muzzle");
    attach(game, muzzle, goblin);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
  });

  it("Guardian Seraph prevents 1 of each opponent source's damage to you, not your own", () => {
    const { game } = table();
    spawn(game, "Guardian Seraph");
    const theirs = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    hit(game, theirs, ref(A), 3);
    expect(life(game, A)).toBe(18);
    hit(game, mine, ref(A), 3);
    expect(life(game, A)).toBe(15);
  });

  it("Hyperion leaves 1 of damage to you or a Hero, none off another creature's", () => {
    const { game } = table();
    const hyperion = spawn(game, "Hyperion, Supreme Hero");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 5);
    hit(game, goblin, ref(hyperion), 9);
    hit(game, goblin, ref(bears), 1);
    expect(life(game, A)).toBe(19);
    expect(damage(game, hyperion)).toBe(1);
    expect(damage(game, bears)).toBe(1);
  });

  it("Gisela doubles damage to an opponent's side and prevents half, rounded up, to hers", () => {
    const { game } = table();
    spawn(game, "Gisela, Blade of Goldnight");
    const mine = spawn(game, "Raging Goblin");
    const theirs = spawn(game, "Raging Goblin", B);
    hit(game, mine, ref(B), 2);
    expect(life(game, B)).toBe(16);
    hit(game, theirs, ref(A), 5);
    expect(life(game, A)).toBe(18);
  });

  it("Callous Giant prevents only damage of 3 or less", () => {
    const { game } = table();
    const giant = spawn(game, "Callous Giant");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(giant), 3);
    expect(damage(game, giant)).toBe(0);
    hit(game, goblin, ref(giant), 4);
    expect(damage(game, giant)).toBe(4);
  });

  it("Ghosts of the Innocent halves damage, rounded down — even damage that can't be prevented", () => {
    const { game } = table();
    spawn(game, "Ghosts of the Innocent");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 5);
    expect(life(game, A)).toBe(18);
    game.debugApplyEffect(B, { kind: "damage-cant-be-prevented" }, []);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
  });
});

describe("damage that can't be prevented (rule 615.12)", () => {
  it("Excruciator's damage goes through a prevention static; another source's doesn't", () => {
    const { game } = table();
    const cho = spawn(game, "Cho-Manno, Revolutionary", B);
    const excruciator = spawn(game, "Excruciator");
    const goblin = spawn(game, "Raging Goblin");
    hit(game, goblin, ref(cho), 1);
    expect(damage(game, cho)).toBe(0);
    hit(game, excruciator, ref(cho), 1);
    expect(damage(game, cho)).toBe(1);
  });

  it("after Flaring Pain, a Healing Salve shield prevents nothing and isn't used up", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: 3 }, [ref(A)]);
    cast(game, toHand(game, "Flaring Pain"));
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
    expect(game.state.preventionShields[0]?.amount).toBe(3);
    // It lapses with the turn.
    nextTurn(game);
    expect(game.state.damageUnpreventableThisTurn).toBeUndefined();
  });

  it("Combust's damage gets through Dawn Elemental's prevention", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const dawn = spawn(game, "Dawn Elemental", B);
    cast(game, toHand(game, "Combust"), { targets: [ref(dawn)] });
    expect(game.state.objects[dawn].zone).toBe("graveyard");
  });

  it("a shield counter still goes, and the damage is dealt", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters.shield = 1;
    const excruciator = spawn(game, "Excruciator");
    hit(game, excruciator, ref(bears), 1);
    expect(counters(game, bears, "shield")).toBe(0);
    expect(damage(game, bears)).toBe(1);
  });
});

describe("damage rules (one-shot prevention and redirection)", () => {
  it("Dovin's −1 prevents damage to and by its target until Dovin's controller's next turn", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin, Hand of Control");
    const goblin = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    loyalty(game, dovin, -1, { targets: [ref(goblin)] });
    hit(game, goblin, ref(A), 1);
    hit(game, mine, ref(goblin), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, goblin)).toBe(0);
    nextTurn(game);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
  });

  it("Eerie Interference stops creatures' damage to you and your creatures, not a spell's", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Eerie Interference"));
    hit(game, goblin, ref(A), 1);
    hit(game, goblin, ref(bears), 1);
    // A creature that arrives later is covered too (615.1).
    const later = spawn(game, "Grizzly Bears");
    hit(game, goblin, ref(later), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, bears) + damage(game, later)).toBe(0);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    game.state.objects[bolt].zone = "hand";
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)], { source: bolt });
    expect(life(game, A)).toBe(17);
  });

  it("a next-time rule covers the whole of one simultaneous event, then goes (615.8)", () => {
    const { game } = table();
    const goblin = spawn(game, "Raging Goblin", B);
    game.debugApplyEffect(A, { kind: "damage-rule", by: { target: 0 }, amount: "next-time" }, [ref(goblin)]);
    // One event: 2 damage to each player at once — both prevented.
    game.debugApplyEffect(B, { kind: "damage", amount: 2, who: "each-player" }, [], { source: goblin });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(game.state.preventionShields).toHaveLength(0);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, who: "each-player" }, [], { source: goblin });
    expect(life(game, A)).toBe(18);
  });

  it("Glarecaster sends the next damage event to it and/or you, all of it, to the target", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const glare = spawn(game, "Glarecaster");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, glare, 0, { targets: [ref(B)] });
    // One event: 2 to every player and creature — Glarecaster's and yours go to B.
    game.debugApplyEffect(B, { kind: "damage", amount: 2, who: "each-player" }, [], { source: goblin });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(16);
    hit(game, goblin, ref(glare), 1);
    expect(damage(game, glare)).toBe(1);
  });

  it("Goblin Psychopath's lost flip waits for its combat damage: a noncombat hit isn't redirected", () => {
    const { game } = table();
    const psycho = spawn(game, "Goblin Psychopath");
    game.debugApplyEffect(A, { kind: "damage-rule", by: { target: "source" }, combat: true, amount: "next-time", redirectTo: "you" }, [], { source: psycho });
    hit(game, psycho, ref(B), 5);
    expect(life(game, B)).toBe(15);
    expect(game.state.preventionShields).toHaveLength(1);
  });

  it("Circle of Solace prevents the next damage a creature of the chosen type deals you", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const circle = spawn(game, "Circle of Solace");
    game.state.objects[circle].chosenCreatureType = "Goblin";
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, circle, 0);
    hit(game, bears, ref(A), 2);
    hit(game, goblin, ref(A), 1);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(17);
  });

  it("Temper prevents the next X and puts that many counters on the creature", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Temper"), { targets: [ref(bears)], x: 2 });
    hit(game, goblin, ref(bears), 3);
    expect(damage(game, bears)).toBe(1);
    expect(counters(game, bears)).toBe(2);
  });

  it("Deflecting Palm prevents the chosen source's next damage to you and deals it to that source's controller", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Deflecting Palm"));
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });

  it("Kor Chant sends all of the chosen source's damage to the first creature to the other, all turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Kor Chant"), { targets: [ref(bears), ref(wall)] });
    hit(game, goblin, ref(bears), 1);
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, wall)).toBe(3);
  });

  it("Kor Haven prevents the target attacker's combat damage", () => {
    const { game, b } = table();
    const haven = spawn(game, "Kor Haven");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: goblin, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, haven, 1, { targets: [ref(goblin)] });
    attack(game, b, [goblin], A);
    expect(life(game, A)).toBe(20);
  });

  it("Turn the Tables sends the combat damage to you to the target attacker", () => {
    const { game, b } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: A },
      { attacker: goblin, defender: A },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, toHand(game, "Turn the Tables"), { targets: [ref(bears)] });
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("Mirror Strike sends the target unblocked creature's combat damage to you to its controller", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: A },
      { attacker: goblin, defender: A },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, toHand(game, "Mirror Strike"), { targets: [ref(bears)] });
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });
});
