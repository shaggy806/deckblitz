/**
 * A trigger's recipient as a reference (`ObjectRef` `"trigger-recipient"`,
 * `LastKnownRefs.recipient`): what the triggering event was aimed at — the
 * creature dealt damage, the player or planeswalker attacked — reaching any
 * effect that takes a reference, and a delayed trigger the ability makes
 * (rule 603.7c).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  grant,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  lands,
  zone,
  activate,
} from "./harness.js";
import { printedCardName } from "../state.js";

describe("a delayed trigger keeps its creator's recipient", () => {
  it("Ohran Viper destroys the creature it dealt combat damage to, at end of combat and not before", () => {
    const { game, a, b } = table();
    const viper = spawn(game, "Ohran Viper");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: viper }];
    a.declareAttackersFn = () => [{ attacker: viper, defender: B }];
    game.advanceUntil((s) => s.delayedTriggers.length > 0);
    expect(zone(game, wall)).toBe("battlefield");
    expect(game.state.delayedTriggers[0]?.recipient?.target).toEqual({ kind: "object", object: wall });
    toStep(game, "postcombat-main");
    expect(zone(game, wall)).toBe("graveyard");
    expect(game.state.delayedTriggers.length).toBe(0);
  });

  it("is untargeted: a creature with shroud is still destroyed", () => {
    const { game, a, b } = table();
    const viper = spawn(game, "Ohran Viper");
    const wall = spawn(game, "Wall of Wood", B);
    grant(game, wall, "shroud");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: viper }];
    attack(game, a, [viper]);
    toStep(game, "postcombat-main");
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("destroys nothing once that creature has left and come back (rule 400.7)", () => {
    const { game, a, b } = table();
    const viper = spawn(game, "Ohran Viper");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: viper }];
    a.declareAttackersFn = () => [{ attacker: viper, defender: B }];
    game.advanceUntil((s) => s.delayedTriggers.length > 0);
    // A new stint of the same object, flickered before end of combat.
    game.state.objects[wall]!.zoneChangeCount = (game.state.objects[wall]!.zoneChangeCount ?? 0) + 1;
    toStep(game, "postcombat-main");
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("Lowland Basilisk's damage outside combat waits for the next combat (its ruling)", () => {
    const { game } = table();
    const basilisk = spawn(game, "Lowland Basilisk");
    const bears = spawn(game, "Wall of Wood", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(basilisk), ref(bears)] });
    // Fought: both alive, and the trigger made its delayed one.
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.delayedTriggers.length).toBe(1);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Sosuke's watches every Warrior you control, not an opponent's", () => {
    const { game, a, b } = table();
    spawn(game, "Sosuke, Son of Seshiro");
    const warrior = spawn(game, "Kashi-Tribe Warriors");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: warrior }];
    attack(game, a, [warrior]);
    toStep(game, "postcombat-main");
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("Sosuke gives other Snakes +1/+0, itself none", () => {
    const { game } = table();
    const sosuke = spawn(game, "Sosuke, Son of Seshiro");
    const viper = spawn(game, "Ohran Viper");
    expect(pt(game, viper)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, sosuke)).toEqual({ power: 3, toughness: 4 });
  });

  it("Ohran Viper's other trigger draws off a player", () => {
    const { game, a } = table();
    const viper = spawn(game, "Ohran Viper");
    pickModes(a, 0);
    const before = game.state.zones.perPlayer[A].library.length;
    attack(game, a, [viper]);
    expect(game.state.zones.perPlayer[A].library.length).toBe(before - 1);
    expect(life(game, B)).toBe(19);
  });
});

describe("any effect that takes a reference reaches the recipient", () => {
  it("Permeating Mass makes the creature it dealt combat damage to a copy of itself", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Permeating Mass");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: mass }];
    attack(game, a, [mass]);
    expect(printedCardName(game.state.objects[wall]!)).toBe("Permeating Mass");
    expect(pt(game, wall)).toEqual({ power: 1, toughness: 3 });
    expect(controller(game, wall)).toBe(B);
  });

  it("the copy permeates in turn", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Permeating Mass");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: mass }];
    attack(game, a, [mass]);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[wall]!.summoningSick = false;
    a.declareBlockersFn = () => [{ blocker: bears, attacker: wall }];
    attack(game, b, [wall], A);
    expect(printedCardName(game.state.objects[bears]!)).toBe("Permeating Mass");
  });

  it("still copies a Permeating Mass that died in the same damage (its ruling)", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Permeating Mass");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: mass }];
    attack(game, a, [mass]);
    expect(zone(game, mass)).toBe("graveyard");
    expect(printedCardName(game.state.objects[giant]!)).toBe("Permeating Mass");
  });

  it("doesn't copy onto a creature the damage killed (its ruling)", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Permeating Mass");
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: elf, attacker: mass }];
    attack(game, a, [mass]);
    expect(zone(game, elf)).toBe("graveyard");
    expect(game.state.objects[elf]!.copyOf ?? null).toBe(null);
  });

  it("Obelisk Spider puts a -1/-1 counter on it, and that drains", () => {
    const { game, a, b } = table();
    const spider = spawn(game, "Obelisk Spider");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: spider }];
    attack(game, a, [spider]);
    expect(counters(game, wall, "-1/-1")).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("Neko-Te keeps it tapped as long as the Equipment stays, and not after", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const neko = spawn(game, "Neko-Te");
    lands(game, "Wastes", 2);
    activate(game, neko, 0, { targets: [ref(bears)] });
    expect(game.state.objects[neko]!.attachedTo).toBe(bears);
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.objects[wall]!.tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[wall]!.tapped).toBe(true);
    // Neko-Te goes; the next untap step untaps it.
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Naturalize", B), { player: B, targets: [ref(neko)] });
    expect(zone(game, neko)).toBe("graveyard");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[wall]!.tapped).toBe(false);
  });

  it("Neko-Te costs a player dealt damage 1 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const neko = spawn(game, "Neko-Te");
    lands(game, "Wastes", 2);
    activate(game, neko, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 2 - 1);
  });
});

describe("the player or planeswalker it's attacking", () => {
  it("Rakdos Roustabout blocked: 1 damage to the player attacked, once however many block", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Rakdos Roustabout");
    const one = spawn(game, "Wall of Wood", B);
    const two = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: ogre },
      { blocker: two, attacker: ogre },
    ];
    attack(game, a, [ogre]);
    expect(life(game, B)).toBe(19);
  });

  it("deals nothing unblocked", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Rakdos Roustabout");
    attack(game, a, [ogre]);
    expect(life(game, B)).toBe(17);
  });

  it("hits the planeswalker attacked, not its controller", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Rakdos Roustabout");
    const walker = spawn(game, "Jace Beleren", B);
    const wall = spawn(game, "Wall of Wood", B);
    const loyalty = game.state.objects[walker]!.counters?.loyalty ?? 0;
    b.declareBlockersFn = () => [{ blocker: wall, attacker: ogre }];
    a.declareAttackersFn = () => [{ attacker: ogre, defender: walker }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[walker]!.counters?.loyalty).toBe(loyalty - 1);
  });
});
