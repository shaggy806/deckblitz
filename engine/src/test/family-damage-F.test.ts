/**
 * Damage group F (batch B250): cards freed by the damage-modification family
 * — static preventions over recipient sets (Losheel, Crystal Barricade,
 * Rescue Retriever, Djeru, Urza's Armor, Sphere of Purity), an Aura's host
 * as source or recipient (Candletrap, Ghostly Possession, Prismatic Ward),
 * one-shot damage rules (Take the Bait, Haze Frog, Terrifying Presence,
 * Defend the Hearth, Kjeldoran Royal Guard, Lithomancer's Focus, Zealot
 * il-Vec), chosen-source shields (Reflect Damage, Oracle's Attendants) and
 * unpreventable damage (Urza's Rage).
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
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
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
/** Bob's turn, his `attackers` declared at `A`, stopped in declare blockers with alice's priority. */
const bobAttacks = (game: Game, b: ReturnType<typeof table>["b"], attackers: readonly ObjectId[]): void => {
  nextTurn(game);
  b.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: A }));
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
};

describe("static preventions over recipient sets", () => {
  it("Losheel prevents combat damage to attacking artifact creatures only, and draws once a turn", () => {
    const { game, a, b } = table();
    spawn(game, "Losheel, Clockwork Scholar");
    const memnite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [
      { blocker: giant, attacker: memnite },
      { blocker: wurm, attacker: bears },
    ];
    attack(game, a, [memnite, bears]);
    expect(game.state.objects[memnite].zone).toBe("battlefield");
    expect(damage(game, memnite)).toBe(0);
    expect(game.state.objects[bears].zone).toBe("graveyard");
    const before = hand(game).length;
    enter(game, "Memnite");
    enter(game, "Memnite");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Crystal Barricade prevents noncombat damage to your other creatures, not to itself", () => {
    const { game } = table();
    const wall = spawn(game, "Crystal Barricade");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(bears), 2);
    hit(game, goblin, ref(wall), 2);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, wall)).toBe(2);
  });

  it("Rescue Retriever counters the other Soldiers and shields other attacking Soldiers, not itself", () => {
    const { game, a, b } = table();
    const vanguard = spawn(game, "Elite Vanguard");
    const retriever = enter(game, "Rescue Retriever");
    expect(counters(game, vanguard)).toBe(1);
    expect(counters(game, retriever)).toBe(0);
    // Not attacking: no shield.
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(vanguard), 1);
    expect(damage(game, vanguard)).toBe(1);
    nextTurn(game);
    nextTurn(game);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [
      { blocker: wurm, attacker: vanguard },
      { blocker: giant, attacker: retriever },
    ];
    attack(game, a, [vanguard, retriever]);
    expect(game.state.objects[vanguard].zone).toBe("battlefield");
    expect(game.state.objects[retriever].zone).toBe("graveyard");
  });

  it("Djeru prevents 1 of each source's damage to your planeswalkers, none of it to you", () => {
    const { game } = table();
    spawn(game, "Djeru, With Eyes Open");
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 5;
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, goblin, ref(jace), 2);
    hit(game, bears, ref(jace), 1);
    expect(counters(game, jace, "loyalty")).toBe(4);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("Urza's Armor prevents 1 of any source's damage to you; Sphere of Purity only an artifact's", () => {
    const { game } = table();
    spawn(game, "Urza's Armor");
    spawn(game, "Sphere of Purity", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const memnite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(18);
    hit(game, memnite, ref(B), 2);
    expect(life(game, B)).toBe(19);
    hit(game, bears, ref(B), 2);
    expect(life(game, B)).toBe(17);
  });
});

describe("Auras naming their host", () => {
  it("Candletrap prevents the enchanted creature's combat damage, not its noncombat damage", () => {
    const { game, a, b } = table();
    const goblin = spawn(game, "Raging Goblin", B);
    const trap = spawn(game, "Candletrap");
    attach(game, trap, goblin);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: goblin, attacker: bears }];
    attack(game, a, [bears]);
    expect(damage(game, bears)).toBe(0);
    expect(game.state.objects[goblin].zone).toBe("graveyard");
  });

  it("Ghostly Possession prevents combat damage to and by the enchanted creature", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const possession = spawn(game, "Ghostly Possession");
    attach(game, possession, bears);
    // Reach: the Spider can block the now-flying Bears.
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: bears }];
    attack(game, a, [bears]);
    expect(damage(game, spider)).toBe(0);
    expect(damage(game, bears)).toBe(0);
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });

  it("Prismatic Ward prevents damage to the enchanted creature from the chosen color only", () => {
    const { game } = table();
    const wall = spawn(game, "Craw Wurm");
    const ward = spawn(game, "Prismatic Ward");
    game.state.objects[ward].chosenOnEnter = "R";
    attach(game, ward, wall);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, goblin, ref(wall), 2);
    expect(damage(game, wall)).toBe(0);
    hit(game, bears, ref(wall), 2);
    expect(damage(game, wall)).toBe(2);
  });
});

describe("one-shot damage rules", () => {
  it("Take the Bait can't be cast on your own turn", () => {
    const { game } = table();
    lands(game, "Plateau", 4);
    expect(() => cast(game, toHand(game, "Take the Bait"))).toThrow();
  });

  it("Take the Bait prevents the combat damage to you, untaps and goads the attackers, and adds a combat", () => {
    const { game, b } = table();
    lands(game, "Plateau", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [bears]);
    cast(game, toHand(game, "Take the Bait"));
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[bears].goadedBy).toContain(A);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // Both combats' damage to alice prevented, the Bears attacking twice.
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Haze Frog prevents every other creature's combat damage this turn, not its own", () => {
    const { game, a } = table();
    const frog = enter(game, "Haze Frog");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [frog, bears]);
    expect(life(game, B)).toBe(18);
  });

  it("Terrifying Presence lets only the target creature's combat damage through", () => {
    const { game, b } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    bobAttacks(game, b, [bears, goblin]);
    cast(game, toHand(game, "Terrifying Presence"), { targets: [ref(goblin)] });
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(19);
  });

  it("Defend the Hearth prevents combat damage to players, not to creatures", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const wall = spawn(game, "Craw Wurm");
    a.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    bobAttacks(game, b, [bears, goblin]);
    cast(game, toHand(game, "Defend the Hearth"));
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(20);
    expect(damage(game, wall)).toBe(2);
  });

  it("Kjeldoran Royal Guard takes the unblocked creatures' combat damage to you", () => {
    const { game, a, b } = table();
    const guard = spawn(game, "Kjeldoran Royal Guard");
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    a.declareBlockersFn = () => [{ blocker: wurm, attacker: goblin }];
    bobAttacks(game, b, [bears, goblin]);
    activate(game, guard, 0);
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(20);
    expect(damage(game, guard)).toBe(2);
  });

  it("Lithomancer's Focus prevents colorless sources' damage to the creature, not colored ones'", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Lithomancer's Focus"), { targets: [ref(bears)] });
    const memnite = spawn(game, "Memnite", B);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, memnite, ref(bears), 3);
    expect(damage(game, bears)).toBe(0);
    hit(game, goblin, ref(bears), 3);
    expect(damage(game, bears)).toBe(3);
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });

  it("Zealot il-Vec: dealing the 1 damage prevents its own combat damage", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Zealot il-Vec");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a, 0);
    attack(game, a, [zealot]);
    expect(damage(game, wurm)).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("Zealot il-Vec: declining keeps its combat damage", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Zealot il-Vec");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a);
    attack(game, a, [zealot]);
    expect(damage(game, wurm)).toBe(0);
    expect(life(game, B)).toBe(19);
  });
});

describe("chosen sources and unpreventable damage", () => {
  it("Reflect Damage sends the chosen source's next damage to its controller, once", () => {
    const { game, a } = table();
    lands(game, "Plateau", 5);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Reflect Damage"));
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
  });

  it("Oracle's Attendants takes all of the chosen source's damage to the target creature this turn", () => {
    const { game, a } = table();
    const attendants = spawn(game, "Oracle's Attendants");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, goblin);
    activate(game, attendants, 0, { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 1);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, attendants)).toBe(2);
    hit(game, other, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });

  it("Urza's Rage kicked deals 10 that can't be prevented; unkicked, 3 that can", () => {
    const { game } = table();
    lands(game, "Mountain", 15);
    const dawn = spawn(game, "Dawn Elemental", B);
    cast(game, toHand(game, "Urza's Rage"), { targets: [ref(dawn)] });
    expect(damage(game, dawn)).toBe(0);
    cast(game, toHand(game, "Urza's Rage"), { targets: [ref(dawn)], kicked: true });
    expect(game.state.objects[dawn].zone).toBe("graveyard");
  });
});
