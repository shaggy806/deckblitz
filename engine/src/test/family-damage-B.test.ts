/**
 * Batch B250, group B — cards freed by the damage-modification family
 * (rules 614.9, 615): static replacements naming an Aura's or Equipment's
 * host, `damage-rule` prevention and redirection over sources and
 * recipients, and damage that can't be prevented (615.12).
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
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const attach = (game: Game, attachment: ObjectId, to: ObjectId): void => {
  game.state.objects[attachment].attachedTo = to;
};

describe("Frenzied Baloth", () => {
  it("its combat damage gets through a Fog", () => {
    const { game, a } = table();
    const baloth = spawn(game, "Frenzied Baloth");
    game.debugApplyEffect(B, { kind: "prevent-all-combat-damage" }, []);
    attack(game, a, [baloth]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Mjölnir, Hammer of Thor", () => {
  it("equips only a worthy creature, and doubles the damage it deals", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const hammer = spawn(game, "Mjölnir, Hammer of Thor");
    const krenko = spawn(game, "Krenko, Mob Boss");
    const goblin = spawn(game, "Raging Goblin");
    expect(() => activate(game, hammer, 0, { targets: [ref(goblin)] })).toThrow();
    activate(game, hammer, 0, { targets: [ref(krenko)] });
    expect(game.state.objects[hammer].attachedTo).toBe(krenko);
    hit(game, krenko, ref(B), 2);
    expect(life(game, B)).toBe(16);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(14);
  });
});

describe("Multiclass Baldric", () => {
  it("grants by class, and prevents damage to the equipped creature only with a full party", () => {
    const { game } = table();
    const baldric = spawn(game, "Multiclass Baldric");
    const bears = spawn(game, "Grizzly Bears");
    attach(game, baldric, bears);
    const goblin = spawn(game, "Raging Goblin", B);
    spawn(game, "Abbey Matron");
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
    spawn(game, "Aetherblade Agent");
    spawn(game, "Abzan Guide");
    spawn(game, "Academy Journeymage");
    expect(keywords(game, bears).has("flying")).toBe(true);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });
});

describe("Blinding Fog", () => {
  it("covers creatures that arrive later, not players; your creatures gain hexproof", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Blinding Fog"));
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    const late = spawn(game, "Hill Giant", B);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(late), 2);
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, late)).toBe(0);
    expect(damage(game, bears)).toBe(0);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Panther Habit", () => {
  it("turns damage to the equipped creature into +1/+1 counters on it", () => {
    const { game } = table();
    const habit = spawn(game, "Panther Habit");
    const bears = spawn(game, "Grizzly Bears");
    attach(game, habit, bears);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(bears), 3);
    expect(damage(game, bears)).toBe(0);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, habit)).toBe(0);
  });
});

describe("Barbed Wire", () => {
  it("prevents the next 1 damage it would deal", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const wire = spawn(game, "Barbed Wire");
    activate(game, wire);
    hit(game, wire, ref(B), 1);
    expect(life(game, B)).toBe(20);
    hit(game, wire, ref(B), 1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Impractical Joke", () => {
  it("deals its 3 damage through a prevention shield", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: "all" }, [ref(bears)]);
    cast(game, toHand(game, "Impractical Joke"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Heart of Light", () => {
  it("prevents damage to and by the enchanted creature", () => {
    const { game } = table();
    const heart = spawn(game, "Heart of Light");
    const bears = spawn(game, "Grizzly Bears");
    attach(game, heart, bears);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, bears)).toBe(0);
    hit(game, bears, ref(B), 2);
    expect(life(game, B)).toBe(20);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Aegis of Honor", () => {
  it("sends the next instant or sorcery damage to you back to that spell's controller, once", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const aegis = spawn(game, "Aegis of Honor");
    const goblin = spawn(game, "Raging Goblin", B);
    const shock = toHand(game, "Shock", B);
    activate(game, aegis);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
    hit(game, shock, ref(A), 2);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
    hit(game, shock, ref(A), 2);
    expect(life(game, A)).toBe(17);
  });
});

describe("Serene Sunset", () => {
  it("prevents the combat damage of exactly the X targets", () => {
    const { game, b } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: A },
      { attacker: goblin, defender: A },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, toHand(game, "Serene Sunset"), { x: 1, targets: [ref(bears)] });
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(19);
  });
});

describe("Ethersworn Shieldmage", () => {
  it("prevents damage to artifact creatures this turn, no others", () => {
    const { game } = table();
    enter(game, "Ethersworn Shieldmage");
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(thopter), 1);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, thopter)).toBe(0);
    expect(damage(game, bears)).toBe(1);
  });
});

describe("Divine Light", () => {
  it("protects only the creatures you control", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Divine Light"));
    hit(game, goblin, ref(mine), 1);
    hit(game, goblin, ref(theirs), 1);
    expect(damage(game, mine)).toBe(0);
    expect(damage(game, theirs)).toBe(1);
  });
});

describe("Karona's Zealot", () => {
  it("its face-up trigger sends all damage to it this turn to the target creature", () => {
    const { game } = table();
    const zealot = spawn(game, "Karona's Zealot");
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const effect = game.registry.get("Karona's Zealot").triggered[0].effect;
    if (effect === null) throw new Error("no effect");
    game.debugApplyEffect(A, effect, [ref(bears)], { source: zealot });
    hit(game, goblin, ref(zealot), 1);
    expect(damage(game, zealot)).toBe(0);
    expect(damage(game, bears)).toBe(1);
    hit(game, goblin, ref(zealot), 1);
    expect(damage(game, bears)).toBe(2);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    // With the target gone, the damage stays where it was going.
    hit(game, goblin, ref(zealot), 1);
    expect(damage(game, zealot)).toBe(1);
  });
});

describe("Reverberation", () => {
  it("deals the target sorcery's damage to its controller instead", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Island", 4, B);
    const axe = toHand(game, "Lava Axe");
    cast(game, axe, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Reverberation", B), { player: B, targets: [ref(axe)] });
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(15);
  });
});

describe("Ignoble Soldier", () => {
  it("deals no combat damage once blocked", () => {
    const { game, a, b } = table();
    const soldier = spawn(game, "Ignoble Soldier");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: soldier }];
    attack(game, a, [soldier]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(damage(game, giant)).toBe(0);
  });
});

describe("Mtenda Lion", () => {
  it("deals no combat damage when the defending player pays {U}", () => {
    const { game, a, b } = table();
    lands(game, "Island", 1, B);
    const lion = spawn(game, "Mtenda Lion");
    pickModes(b, 0);
    attack(game, a, [lion]);
    expect(life(game, B)).toBe(20);
  });

  it("deals its damage when they don't", () => {
    const { game, a, b } = table();
    lands(game, "Island", 1, B);
    const lion = spawn(game, "Mtenda Lion");
    pickModes(b);
    attack(game, a, [lion]);
    expect(life(game, B)).toBe(18);
  });
});
