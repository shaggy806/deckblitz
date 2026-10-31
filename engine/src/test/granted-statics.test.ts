/**
 * A static ability that grants a static ability (`StaticAbility.grantsStatic`
 * — rule 613.1f, layer 6): "commander creatures you own have 'Creature tokens
 * you control get +2/+2'" (Inspiring Leader), "it has 'Equipped creature gets
 * +1/+1 and has trample'" (Rune of Might), "all Sliver creatures have 'This
 * creature gets +1/+1 as long as you control a Swamp'" (Sedge Sliver),
 * "equipped creature has 'You can't lose the game …'" (Cloudsteel Kirin).
 * The granted static works from the object that has it (rule 113.10): its
 * "you" is that object's controller, its "equipped creature" what that object
 * is attached to — and it goes when the grant does.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, keywords, lands, pt, ref, spawn, table, toStep } from "./harness.js";

/** A 1/1 Thrull creature token created for `player`. */
function token(game: Game, player: PlayerId): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: "1/1 Thrull Token", count: 1 });
  const made = game.battlefield.find((id) => !before.has(id));
  if (made === undefined) throw new Error("no token made");
  return made;
}

describe("Inspiring Leader", () => {
  it("a commander you own pumps its controller's creature tokens, and only theirs", () => {
    const { game } = table();
    spawn(game, "Inspiring Leader");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const mine = token(game, A);
    const theirs = token(game, B);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    // Not a token, and the commander itself isn't one either.
    expect(pt(game, commander)).toEqual({ power: 2, toughness: 2 });
  });

  it("does nothing without a commander, and follows the commander to its new controller", () => {
    const { game } = table();
    spawn(game, "Inspiring Leader");
    const bears = spawn(game, "Grizzly Bears");
    const mine = token(game, A);
    const theirs = token(game, B);
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
    game.state.objects[bears].isCommander = true;
    // Bob takes the commander: the granted static's "you" is now him.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
  });

  it("a commander that loses all its abilities after the grant loses the granted static too (rule 613.7)", () => {
    const { game } = table();
    spawn(game, "Inspiring Leader");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const mine = token(game, A);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "end-of-turn" }, [ref(commander)]);
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
  });

  it("an opponent's commander gets nothing from your Background", () => {
    const { game } = table();
    spawn(game, "Inspiring Leader");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].isCommander = true;
    const bobs = token(game, B);
    expect(pt(game, bobs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Criminal Past", () => {
  it("a commander you own has menace and +X/+0 for the creature cards in its controller's graveyard", () => {
    const { game } = table();
    spawn(game, "Criminal Past");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    game.debugSpawn("Hill Giant", A, "graveyard");
    game.debugSpawn("Grizzly Bears", A, "graveyard");
    game.debugSpawn("Hill Giant", B, "graveyard");
    game.debugSpawn("Plains", A, "graveyard");
    expect(pt(game, commander)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, commander).has("menace")).toBe(true);
  });
});

describe("the Runes", () => {
  it("Rune of Might on an Equipment gives it 'Equipped creature gets +1/+1 and has trample'", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mace = spawn(game, "+2 Mace");
    const bears = spawn(game, "Grizzly Bears");
    const rune = spawn(game, "Rune of Might");
    game.state.objects[rune].attachedTo = mace;
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    activate(game, mace, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("Rune of Might on a creature pumps it directly; on an unattached Equipment, nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const rune = spawn(game, "Rune of Might");
    game.state.objects[rune].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    const mace = spawn(game, "+2 Mace");
    game.state.objects[rune].attachedTo = mace;
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Rune of Flight's grant leaves with the Rune", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mace = spawn(game, "+2 Mace");
    const bears = spawn(game, "Grizzly Bears");
    const rune = spawn(game, "Rune of Flight");
    game.state.objects[rune].attachedTo = mace;
    activate(game, mace, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    game.debugMove(rune, "graveyard");
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Sedge Sliver", () => {
  it("each Sliver gets +1/+1 while its own controller controls a Swamp", () => {
    const { game } = table();
    const sedge = spawn(game, "Sedge Sliver");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Muscle Sliver", B);
    spawn(game, "Swamp", B);
    // Bob's 1/1 Muscle Sliver: +1/+1 from itself (every Sliver's), +1/+1
    // from the granted static (Bob controls a Swamp). Alice's Sedge Sliver
    // has Muscle's +1/+1 but no Swamp yet.
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, sedge)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Swamp");
    expect(pt(game, sedge)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("two Sedge Slivers grant two instances, each its own +1/+1", () => {
    const { game } = table();
    const one = spawn(game, "Sedge Sliver");
    spawn(game, "Sedge Sliver");
    spawn(game, "Swamp");
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Cloudsteel Kirin", () => {
  it("the equipped creature's controller can't lose the game", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const kirin = spawn(game, "Cloudsteel Kirin");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, kirin, 0, { targets: [ref(bears)] });
    expect(game.state.objects[kirin].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("flying")).toBe(true);
    game.state.players[A].life = 0;
    toStep(game, "begin-combat");
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("unattached, it grants nothing: its controller loses at 0 life", () => {
    const { game } = table();
    spawn(game, "Cloudsteel Kirin");
    game.state.players[A].life = 0;
    toStep(game, "begin-combat");
    expect(game.state.players[A].hasLost).toBe(true);
  });
});
