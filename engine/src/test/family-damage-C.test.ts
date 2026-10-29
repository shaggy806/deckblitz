/**
 * Batch B250, group C — cards freed by the damage-modification family
 * (rules 614.9, 615): static redirections and preventions, one-shot
 * `damage-rule`s, and damage that can't be prevented.
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
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pt,
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
const attach = (game: Game, aura: ObjectId, to: ObjectId): void => {
  game.state.objects[aura].attachedTo = to;
};
/** Bob's `attackers` attack alice on his next turn, `blocks` declared by her. */
const bobAttacks = (
  game: Game,
  b: { declareAttackersFn: unknown },
  a: { declareBlockersFn: unknown },
  attackers: readonly ObjectId[],
  blocks: readonly { blocker: ObjectId; attacker: ObjectId }[] = [],
): void => {
  nextTurn(game);
  (b as { declareAttackersFn: () => unknown }).declareAttackersFn = () =>
    attackers.map((attacker) => ({ attacker, defender: A }));
  (a as { declareBlockersFn: () => unknown }).declareBlockersFn = () => blocks;
  game.advanceUntil((s) => s.turn.step === "postcombat-main");
};

describe("Comeuppance", () => {
  it("prevents an opposing creature's damage and deals that much to the creature", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Comeuppance"));
    hit(game, giant, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(damage(game, giant)).toBe(3);
    expect(life(game, B)).toBe(20);
  });

  it("deals a noncreature source's prevented damage to its controller", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const totem = spawn(game, "Wastes", B);
    cast(game, toHand(game, "Comeuppance"));
    hit(game, totem, ref(A), 2);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });

  it("leaves your own sources' damage alone", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Comeuppance"));
    hit(game, mine, ref(A), 3);
    expect(life(game, A)).toBe(17);
  });
});

describe("Inquisitor's Flail", () => {
  it("doubles the equipped creature's combat damage and other creatures' combat damage to it", () => {
    const { game, a, b } = table();
    const flail = spawn(game, "Inquisitor's Flail");
    const bears = spawn(game, "Grizzly Bears");
    attach(game, flail, bears);
    const wall = spawn(game, "Wall of Wood", B); // 0/3
    const goblin = spawn(game, "Raging Goblin", B);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    // Bob's goblin is blocked by the equipped bears: it takes 2 doubled to 4
    // (dies), and deals 1 doubled to 2.
    game.state.objects[bears].tapped = false;
    bobAttacks(game, b, a, [goblin], [{ blocker: bears, attacker: goblin }]);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("Saving Grace", () => {
  it("sends the turn's damage to you and your permanents to the enchanted creature, even after it leaves", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant"); // 3/3, +0/+3
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const grace = toHand(game, "Saving Grace");
    cast(game, grace, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 6 });
    hit(game, goblin, ref(A), 2);
    hit(game, goblin, ref(bears), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, giant)).toBe(3);
    // The Aura gone, the redirection stays on the creature it enchanted.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(grace)]);
    expect(zone(game, grace)).toBe("graveyard");
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, giant)).toBe(4);
    // Another player's damage is theirs.
    hit(game, goblin, ref(B), 1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Veteran Bodyguard", () => {
  it("takes unblocked creatures' damage to you while untapped, not a blocked one's", () => {
    const { game, a, b } = table();
    const guard = spawn(game, "Veteran Bodyguard");
    const wall = spawn(game, "Wall of Wood");
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    bobAttacks(game, b, a, [bears, goblin], [{ blocker: wall, attacker: goblin }]);
    expect(life(game, A)).toBe(20);
    expect(damage(game, guard)).toBe(2);
    expect(damage(game, wall)).toBe(1);
  });

  it("does nothing while tapped", () => {
    const { game, a, b } = table();
    const guard = spawn(game, "Veteran Bodyguard", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    game.state.objects[guard].tapped = true;
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, A)).toBe(18);
    expect(damage(game, guard)).toBe(0);
  });
});

describe("Soltari Guerrillas", () => {
  it("sends its next combat damage to an opponent to the target creature", () => {
    const { game, a } = table();
    const soltari = spawn(game, "Soltari Guerrillas");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, soltari, 0, { targets: [ref(giant)] });
    attack(game, a, [soltari]);
    expect(life(game, B)).toBe(20);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Security Blockade", () => {
  it("makes a Knight, and its land prevents the next 1 damage to you", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const plains = spawn(game, "Plains");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Security Blockade"), { targets: [ref(plains)] });
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Knight Token")).toBe(true);
    activate(game, plains, 1);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(18);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(17);
  });
});

describe("Azorius Ploy", () => {
  it("may target the same creature twice", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Azorius Ploy"), { targets: [ref(giant), ref(giant)] });
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Morningtide's Light", () => {
  it("flickers the targets at the end step, shields you until your next turn, and exiles itself", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const light = toHand(game, "Morningtide's Light");
    cast(game, light, { targets: [ref(bears)] });
    expect(zone(game, light)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    // Bob's turn: the bears came back tapped as a new object; his goblin
    // can't hurt alice.
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
  });
});

describe("Pack Leader", () => {
  it("pumps other Dogs, and its attack prevents combat damage to your Dogs", () => {
    const { game, a, b } = table();
    const leader = spawn(game, "Pack Leader");
    const other = spawn(game, "Pack Leader");
    expect(pt(game, leader)).toEqual({ power: 3, toughness: 3 });
    const wall = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: leader }];
    attack(game, a, [leader, other]);
    expect(zone(game, leader)).toBe("battlefield");
    expect(damage(game, leader)).toBe(0);
    expect(life(game, B)).toBe(17);
  });
});

describe("Riot Control", () => {
  it("gains 1 per opposing creature and prevents damage to you, not your creatures", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Riot Control"));
    expect(life(game, A)).toBe(22);
    hit(game, goblin, ref(A), 5);
    expect(life(game, A)).toBe(22);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });
});

describe("Arrow Storm", () => {
  it("deals 4, or 5 that can't be prevented if you attacked", () => {
    const { game, a } = table();
    lands(game, "Mountain", 10);
    spawn(game, "Glacial Chasm", B);
    cast(game, toHand(game, "Arrow Storm"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    const goblin = spawn(game, "Raging Goblin");
    attack(game, a, [goblin]);
    cast(game, toHand(game, "Arrow Storm"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });
});

describe("Subdue", () => {
  it("prevents the target's combat damage and gives it +0/+X for its mana value", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Subdue"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 7 });
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Loafing Giant", () => {
  it("mills a card on attack, and a milled land prevents its combat damage", () => {
    const { game, a } = table();
    const giant = spawn(game, "Loafing Giant");
    const before = graveyard(game, A).length;
    attack(game, a, [giant]);
    expect(graveyard(game, A).length).toBe(before + 1);
    expect(life(game, B)).toBe(20);
  });
});

describe("Orbs of Warding and Protection of the Hekma", () => {
  it("each prevent 1 of a creature's / an opposing source's damage to you", () => {
    const { game } = table();
    spawn(game, "Orbs of Warding");
    spawn(game, "Protection of the Hekma");
    const giant = spawn(game, "Hill Giant", B);
    const land = spawn(game, "Wastes", B);
    hit(game, giant, ref(A), 3);
    expect(life(game, A)).toBe(19);
    hit(game, land, ref(A), 3);
    expect(life(game, A)).toBe(17);
  });
});

describe("Thwart the Enemy, Dolmen Gate, Temporal Isolation, Empyrial Archangel", () => {
  it("Thwart the Enemy prevents opposing creatures' damage only", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Thwart the Enemy"));
    hit(game, giant, ref(A), 3);
    hit(game, mine, ref(B), 3);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });

  it("Dolmen Gate prevents combat damage to your attackers", () => {
    const { game, a, b } = table();
    spawn(game, "Dolmen Gate");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(damage(game, giant)).toBe(2);
  });

  it("Temporal Isolation gives shadow and prevents the enchanted creature's damage", () => {
    const { game } = table();
    const iso = spawn(game, "Temporal Isolation");
    const giant = spawn(game, "Hill Giant", B);
    attach(game, iso, giant);
    hit(game, giant, ref(A), 3);
    expect(life(game, A)).toBe(20);
  });

  it("Empyrial Archangel takes the damage dealt to you", () => {
    const { game } = table();
    const angel = spawn(game, "Empyrial Archangel");
    const giant = spawn(game, "Hill Giant", B);
    hit(game, giant, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(damage(game, angel)).toBe(3);
  });
});

describe("Pyrewood Gearhulk", () => {
  it("pumps the others and makes damage unpreventable this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Glacial Chasm", B);
    const goblin = spawn(game, "Raging Goblin");
    enter(game, "Pyrewood Gearhulk");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(18);
  });
});
