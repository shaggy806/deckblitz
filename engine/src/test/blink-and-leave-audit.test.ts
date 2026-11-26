import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  enter,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/**
 * A rules audit's fourth slice (2026-11-26, the user's ask): blink, tokens
 * and particular cards leaving the battlefield, and the abilities that
 * follow them there — "until ~ leaves", delayed triggers aimed at one
 * object, an Aura's own leave triggers. Rule 400.7: an object that changes
 * zones is a new object with no memory of the old one.
 */

const named = (game: Game, name: string, player?: PlayerId): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === name && (player === undefined || game.state.objects[id].controller === player),
  );

/** `count` Spirit tokens for `player`, made in one event (one stack). */
function spirits(game: Game, count: number, player: PlayerId = B): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: "Spirit Token", count });
  settle(game);
  const made = named(game, "Spirit Token", player);
  expect(tokensNamed(game, "Spirit Token", player)).toBe(count);
  return made[0];
}

describe("blink and leaving the battlefield, audited", () => {
  it("Banisher Priest gone before its enters trigger resolves exiles nothing (rule 610.3c)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const priest = enter(game, "Banisher Priest", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    destroy(game, priest);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Oblivion Ring gone before its enters trigger resolves exiles for good: its leave trigger resolved first (rules 603.6, 610.3)", () => {
    // The two-trigger wording: "When ~ enters, exile another target nonland
    // permanent. When ~ leaves the battlefield, return the exiled card."
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const ring = enter(game, "Oblivion Ring", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    destroy(game, ring);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
  });

  it("a blinked Banisher Priest lets its card go, and the new Priest exiles anew (rules 400.7, 610.3)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const priest = enter(game, "Banisher Priest");
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Plains", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(priest)] });
    expect(zone(game, priest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(zone(game, giant)).toBe("exile");
  });

  it("one token of a stack exiled until a Priest leaves: the rest stay, and none comes back (rules 111.8, 610.3)", () => {
    const { game, a } = table();
    const first = spirits(game, 3);
    pickTargets(a, first);
    const priest = enter(game, "Banisher Priest");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(2);
    destroy(game, priest);
    settle(game);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(2);
  });

  it("one token of a stack blinked is gone; the others stay (rule 111.8)", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 3 });
    settle(game);
    const first = named(game, "Spirit Token", A)[0];
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(first)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });

  it("a Sneak Attacked creature blinked before the end step isn't sacrificed: it's a new object (rule 400.7)", () => {
    const { game, a } = table();
    const sneak = spawn(game, "Sneak Attack");
    lands(game, "Mountain", 1);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    activate(game, sneak, 0);
    expect(zone(game, giant)).toBe("battlefield");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(giant)] });
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("the same Sneak Attacked creature, not blinked, is sacrificed (control for the test above)", () => {
    const { game, a } = table();
    const sneak = spawn(game, "Sneak Attack");
    lands(game, "Mountain", 1);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    activate(game, sneak, 0);
    nextTurn(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("an unearthed creature blinked comes back as a new object: no exile at end step, and it can die normally (rules 702.84a, 400.7)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const zombie = toGraveyard(game, "Dregscape Zombie");
    activate(game, zombie, 0);
    expect(zone(game, zombie)).toBe("battlefield");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, zombie)).toBe("battlefield");
    destroy(game, zombie);
    settle(game);
    expect(zone(game, zombie)).toBe("graveyard");
  });

  it("an unearthed creature not blinked is exiled when it would die (control for the test above)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const zombie = toGraveyard(game, "Dregscape Zombie");
    activate(game, zombie, 0);
    destroy(game, zombie);
    settle(game);
    expect(zone(game, zombie)).toBe("exile");
  });

  it("Flickerwisp's token doesn't return at the end step; its card does (rules 111.8, 603.7)", () => {
    const { game, a } = table();
    const token = spirits(game, 1);
    pickTargets(a, token);
    enter(game, "Flickerwisp");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Flickerwisp");
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });

  it("Flickerwisp's card that left exile before the end step stays where it went (rules 400.7, 610.3)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Flickerwisp");
    expect(zone(game, bears)).toBe("exile");
    expect(game.debugMove(bears, "graveyard")).toBe(true);
    settle(game);
    const where = zone(game, bears);
    expect(where).toBe("graveyard");
    nextTurn(game);
    expect(zone(game, bears)).toBe(where);
  });

  it("a stolen creature blinked by Flickerwisp comes back under its owner's control (rules 610.3c, 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Act of Treason"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    pickTargets(a, bears);
    enter(game, "Flickerwisp");
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });

  it("a stolen creature blinked by Momentary Blink returns under its owner's control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Act of Treason"), { targets: [ref(bears)] });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Momentary Blink"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });

  it("Rancor on a blinked creature goes to the graveyard and comes back to hand (rules 704.5m, 603.10a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const rancor = toHand(game, "Rancor");
    cast(game, rancor, { targets: [ref(bears)] });
    expect(zone(game, rancor)).toBe("battlefield");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, rancor)).toBe("hand");
  });

  it("Angelic Destiny on a blinked creature goes to the graveyard and stays: its creature didn't die (rule 603.10a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 5);
    const destiny = toHand(game, "Angelic Destiny");
    cast(game, destiny, { targets: [ref(bears)] });
    expect(zone(game, destiny)).toBe("battlefield");
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(zone(game, destiny)).toBe("graveyard");
  });

  it("Angelic Destiny whose creature dies returns to hand (control for the test above)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const destiny = toHand(game, "Angelic Destiny");
    cast(game, destiny, { targets: [ref(bears)] });
    destroy(game, bears);
    settle(game);
    expect(zone(game, destiny)).toBe("hand");
  });

  it("Blood Artist sees each token of a destroyed stack die (rules 111.7, 704.5d, 603.10a)", () => {
    const { game, a } = table();
    spawn(game, "Blood Artist");
    spirits(game, 3);
    pickTargets(a, B);
    const before = life(game, A);
    const theirs = life(game, B);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent" } });
    settle(game);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
    expect(life(game, A)).toBe(before + 3);
    expect(life(game, B)).toBe(theirs - 3);
  });

  it("a Kiki-Jiki copy of Banisher Priest exiles until it leaves; sacrificed at the end step, the card returns (rules 111.7, 610.3)", () => {
    const { game, a } = table();
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    const priest = spawn(game, "Banisher Priest");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    activate(game, kiki, 0, { targets: [ref(priest)] });
    expect(named(game, "Banisher Priest").length).toBe(2);
    expect(zone(game, giant)).toBe("exile");
    nextTurn(game);
    expect(named(game, "Banisher Priest").length).toBe(1);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(B);
  });

  it("a token with undying dies and doesn't return: it ceased to exist (rules 111.7, 702.93a)", () => {
    const { game } = table();
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    const geist = spawn(game, "Strangleroot Geist");
    activate(game, kiki, 0, { targets: [ref(geist)] });
    const token = named(game, "Strangleroot Geist").find((id) => id !== geist)!;
    destroy(game, token);
    settle(game);
    expect(named(game, "Strangleroot Geist")).toEqual([geist]);
  });

  it("the card itself with undying returns (control for the test above)", () => {
    const { game } = table();
    const geist = spawn(game, "Strangleroot Geist");
    destroy(game, geist);
    settle(game);
    expect(zone(game, geist)).toBe("battlefield");
    expect(game.state.objects[geist].counters["+1/+1"]).toBe(1);
  });

  it("Skyclave Apparition blinked: its leave trigger pays out for the card it exiled, which stays; the new one exiles anew (rules 607.2a, 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const apparition = enter(game, "Skyclave Apparition");
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Plains", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(apparition)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    const bobTokens = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === B && game.state.objects[id].isToken,
    );
    expect(bobTokens.length).toBe(1);
    expect(pt(game, bobTokens[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("an enters trigger still resolves after its source was blinked, and the new object's triggers too (rules 113.7a, 400.7)", () => {
    const { game } = table();
    const held = game.handOf(A).length;
    const visionary = enter(game, "Elvish Visionary", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(visionary)] });
    expect(zone(game, visionary)).toBe("battlefield");
    expect(game.handOf(A).length).toBe(held + 2);
  });

  it("Equipment on a blinked creature stays on the battlefield, unattached (rules 301.5c, 704.5n)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Wastes", 1);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(zone(game, splitter)).toBe("battlefield");
    expect(game.state.objects[splitter].attachedTo).toBe(null);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("a token phased out doesn't cease to exist, and phases in at its controller's untap step (rules 702.26b, 702.26d)", () => {
    const { game } = table();
    const token = spirits(game, 1);
    game.debugApplyEffect(B, { kind: "phase-out", target: 0 }, [ref(token)]);
    settle(game);
    expect(zone(game, token)).toBe("phased-out");
    nextTurn(game);
    expect(zone(game, token)).toBe("battlefield");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(1);
  });

  it("a Priest exiled by another Priest: its card comes back, and when the second leaves the first returns and exiles anew (rule 610.3)", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const mine = enter(game, "Banisher Priest");
    expect(zone(game, bears)).toBe("exile");
    // Bob's Priest takes alice's: the Bears come back.
    pickTargets(b, mine);
    const theirs = enter(game, "Banisher Priest", B);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    // Bob's Priest goes: alice's returns, a new object, and its trigger takes the Bears again.
    pickTargets(a, bears);
    destroy(game, theirs, A);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Oblivion Ring on a token: when the Ring leaves, nothing returns (rule 111.8)", () => {
    const { game, a } = table();
    const token = spirits(game, 1);
    pickTargets(a, token);
    const ring = enter(game, "Oblivion Ring");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
    destroy(game, ring);
    settle(game);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
  });

  it("Ghostly Flicker on a token and a card: the card returns, the token doesn't (rule 111.8)", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 });
    settle(game);
    const token = named(game, "Spirit Token", A)[0];
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Ghostly Flicker"), { targets: [ref(token), ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });

  it("a commander exiled until a Priest leaves goes to the command zone, and doesn't come back from there (rules 903.9a, 610.3)", () => {
    const { game, b } = table({ commanders: ["Kiki-Jiki, Mirror Breaker"] });
    const kiki = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === "Kiki-Jiki, Mirror Breaker")!;
    expect(game.debugMove(kiki, "battlefield")).toBe(true);
    settle(game);
    pickTargets(b, kiki);
    const priest = enter(game, "Banisher Priest", B);
    expect(zone(game, kiki)).toBe("command");
    destroy(game, priest, A);
    settle(game);
    expect(zone(game, kiki)).toBe("command");
  });

  it("a blinked creature loses its counters, its until-end-of-turn pump and its damage (rule 400.7)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(giant)]);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" }, [ref(giant)]);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 2 } as never, [ref(giant)]);
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 8, toughness: 8 });
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(giant)] });
    const o = game.state.objects[giant];
    expect(o.counters["+1/+1"] ?? 0).toBe(0);
    expect(o.damageMarked).toBe(0);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});
