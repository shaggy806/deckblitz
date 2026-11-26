import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, grant, lands, life, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

/**
 * A rules audit's third slice (2026-11-26): keywords of rule 702, two at a
 * time. Each keyword has its own tests; these ask what happens where two
 * meet, or where one meets prevention, regeneration or a counter.
 */
type Seat = ReturnType<typeof table>["a"];

/** Alice's `attackers` at bob, bob's `blocks`, on to alice's priority in the
 * declare blockers step. */
function blocked(
  game: Game,
  a: Seat,
  b: Seat,
  attackers: readonly ObjectId[],
  blocks: readonly { blocker: ObjectId; attacker: ObjectId }[],
): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  b.declareBlockersFn = () => [...blocks];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === A);
}

const counters = (game: Game, id: ObjectId, kind: string): number => game.state.objects[id].counters?.[kind] ?? 0;

describe("keywords together, audited", () => {
  it("damage protection prevents gains no lifelink life and destroys nothing by deathtouch (rules 702.15b, 702.2b, 702.16e)", () => {
    // Vampire Nighthawk (2/3 flying, deathtouch, lifelink) blocked by White
    // Knight (2/2 first strike, protection from black).
    const { game, a, b } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    const knight = spawn(game, "White Knight", B);
    grant(game, knight, "reach");
    const before = life(game, A);
    blocked(game, a, b, [hawk], [{ blocker: knight, attacker: hawk }]);
    toStep(game, "postcombat-main");
    expect(zone(game, knight)).toBe("battlefield");
    expect(game.state.objects[knight].damageMarked).toBe(0);
    expect(life(game, A)).toBe(before);
    expect(game.state.objects[hawk].damageMarked).toBe(2);
  });

  it("a trampler blocked by a creature with protection assigns it lethal damage anyway, and only the rest goes over (rule 702.19c)", () => {
    // Colossal Dreadmaw (6/6 trample, green) and a White Knight given
    // protection from green: 2 must go on the Knight, prevented; 4 tramples over.
    const { game, a, b } = table();
    const maw = spawn(game, "Colossal Dreadmaw");
    const knight = spawn(game, "White Knight", B);
    game.debugApplyEffect(B, { kind: "grant-protection", target: 0, from: { colors: ["G"] }, duration: "end-of-turn" }, [ref(knight)]);
    const before = life(game, B);
    blocked(game, a, b, [maw], [{ blocker: knight, attacker: maw }]);
    toStep(game, "postcombat-main");
    expect(zone(game, knight)).toBe("battlefield");
    expect(life(game, B)).toBe(before - 4);
  });

  it("deathtouch's destruction can be regenerated (rules 702.2b, 701.19a)", () => {
    const { game, a, b } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    const skeletons = spawn(game, "Drudge Skeletons", B);
    grant(game, skeletons, "reach");
    blocked(game, a, b, [hawk], [{ blocker: skeletons, attacker: hawk }]);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(skeletons)]);
    toStep(game, "postcombat-main");
    expect(zone(game, skeletons)).toBe("battlefield");
    expect(game.state.objects[skeletons].tapped).toBe(true);
    expect(game.state.objects[skeletons].damageMarked).toBe(0);
  });

  it("deathtouch doesn't destroy an indestructible creature (rules 702.2b, 702.12b)", () => {
    const { game, a, b } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    const myr = spawn(game, "Darksteel Myr", B);
    grant(game, myr, "reach");
    blocked(game, a, b, [hawk], [{ blocker: myr, attacker: hawk }]);
    toStep(game, "postcombat-main");
    expect(zone(game, myr)).toBe("battlefield");
  });

  it("a deathtouch source that deals no damage destroys nothing (rule 702.2b: any nonzero amount)", () => {
    // Typhoid Rats (1/1 deathtouch) at power 0 block Grizzly Bears.
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const rats = spawn(game, "Typhoid Rats", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" }, [ref(rats)]);
    blocked(game, a, b, [bears], [{ blocker: rats, attacker: bears }]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, rats)).toBe("graveyard");
  });

  it("a first-striking deathtouch blocker kills a double striker before its regular damage (rules 702.7b, 702.4b)", () => {
    // Colossal Dreadmaw (6/6 trample) with double strike would deal 6 in each step; a
    // blocker with first strike and deathtouch deals its damage in the first
    // step too, so the Dreadmaw's second strike never comes.
    const { game, a, b } = table();
    const maw = spawn(game, "Colossal Dreadmaw");
    grant(game, maw, "double-strike");
    const rats = spawn(game, "Typhoid Rats", B);
    grant(game, rats, "first-strike");
    const before = life(game, B);
    blocked(game, a, b, [maw], [{ blocker: rats, attacker: maw }]);
    toStep(game, "postcombat-main");
    expect(zone(game, maw)).toBe("graveyard");
    expect(zone(game, rats)).toBe("graveyard");
    // Its trample sent 5 of the first strike over the Rats' lethal 1; no second strike.
    expect(life(game, B)).toBe(before - 5);
  });

  it("double strike with lifelink gains life in each combat damage step (rules 702.4b, 702.15b)", () => {
    const { game, a } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    grant(game, hawk, "double-strike");
    a.declareAttackersFn = () => [{ attacker: hawk, defender: B }];
    const mine = life(game, A);
    const theirs = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(theirs - 4);
    expect(life(game, A)).toBe(mine + 4);
  });

  it("a persist creature killed by wither damage has a -1/-1 counter and doesn't return (rules 702.80a, 702.79a)", () => {
    // Boggart Ram-Gang (3/3 wither, toughness raised to 5) blocked by Kitchen
    // Finks (3/2 persist): the Finks die with three -1/-1 counters; the
    // Ram-Gang marks the Finks' 3 as plain damage.
    const { game, a, b } = table();
    const gang = spawn(game, "Boggart Ram-Gang");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" }, [ref(gang)]);
    const finks = spawn(game, "Kitchen Finks", B);
    blocked(game, a, b, [gang], [{ blocker: finks, attacker: gang }]);
    toStep(game, "postcombat-main");
    const onField = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Kitchen Finks");
    expect(onField).toEqual([]);
    expect(zone(game, finks)).toBe("graveyard");
    expect(counters(game, gang, "-1/-1")).toBe(0);
    expect(game.state.objects[gang].damageMarked).toBe(3);
  });

  it("the same Finks blocking a creature without wither persists (control for the test above)", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" }, [ref(giant)]);
    const finks = spawn(game, "Kitchen Finks", B);
    blocked(game, a, b, [giant], [{ blocker: finks, attacker: giant }]);
    toStep(game, "postcombat-main");
    const onField = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Kitchen Finks");
    expect(onField.length).toBe(1);
    expect(counters(game, onField[0], "-1/-1")).toBe(1);
  });

  it("an overloaded spell's unoverloaded cast at a warded creature does trigger ward (control for the test below)", () => {
    const { game } = table();
    const sculptor = spawn(game, "Aegis Sculptor", B);
    lands(game, "Island", 7);
    const rift = toHand(game, "Cyclonic Rift");
    cast(game, rift, { targets: [ref(sculptor)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
  });

  it("myriad's tokens enter attacking, not declared: the lone declared attacker still gets exalted (rules 702.83b, 702.116a)", () => {
    // Four players. Broodbirth Viper (3/3 myriad) declared alone at bob,
    // with alice's Noble Hierarch (exalted): copies at carol and dave.
    const { game, a } = table({ players: 4 });
    const viper = spawn(game, "Broodbirth Viper");
    spawn(game, "Noble Hierarch");
    a.declareAttackersFn = () => [{ attacker: viper, defender: B }];
    a.chooseModesFn = () => [0]; // yes to myriad's "you may"
    const bob = life(game, B);
    const carol = life(game, C);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(bob - 4);
    expect(life(game, C)).toBe(carol - 3);
    const vipers = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Broodbirth Viper");
    // The copies are exiled at end of combat (702.116a).
    expect(vipers).toEqual([viper]);
  });

  it("annihilator makes the defending player sacrifice, not another opponent (rule 702.86a)", () => {
    const { game, a } = table({ players: 4 });
    const crusher = spawn(game, "Ulamog's Crusher");
    const bobs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const carols = [spawn(game, "Grizzly Bears", C), spawn(game, "Grizzly Bears", C)];
    a.declareAttackersFn = () => [{ attacker: crusher, defender: B }];
    toStep(game, "postcombat-main");
    expect(bobs.filter((id) => zone(game, id) === "battlefield").length).toBe(1);
    expect(carols.every((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("two creatures attacking two different players aren't attacking alone: no exalted (rule 702.83b)", () => {
    const { game, a } = table({ players: 4 });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Noble Hierarch");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: C },
    ];
    const bob = life(game, B);
    const carol = life(game, C);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(bob - 2);
    expect(life(game, C)).toBe(carol - 3);
  });

  it("an overloaded spell targets nothing, so ward doesn't trigger (rules 702.96b, 702.21a)", () => {
    const { game } = table();
    const sculptor = spawn(game, "Aegis Sculptor", B);
    lands(game, "Island", 7);
    const rift = toHand(game, "Cyclonic Rift");
    cast(game, rift, { overload: true, settle: false });
    const stack = game.state.zones.shared.stack;
    expect(stack.length).toBe(1);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, sculptor)).toBe("hand");
  });
});
