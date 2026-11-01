/**
 * "Blocked or was blocked [by …] this turn" — `CardFilter.blockedThisTurn`,
 * read off `TurnHistory.blocks`; and "at this turn's next end of combat"
 * (`end-of-combat-this-turn`).
 *
 * What each test pins down:
 *
 * - You Cannot Pass!: either side of a block by a legendary creature, after
 *   combat too and with the legend gone; an unrelated block or none isn't one;
 * - the partner as it was at the block: a creature that became legendary later
 *   doesn't count, one that stopped being one still does;
 * - a creature that left the battlefield and came back never blocked (400.7);
 *   nor did one put onto the battlefield blocking (509.4);
 * - the history lapses with the turn;
 * - Sea Troll: its ability only after a block with a blue creature, either way;
 * - Venomous Breath: both sides of the target's blocks at end of combat, the
 *   blocks read then, though the target has died; never next turn if cast too
 *   late; a later incarnation's blocks aren't the target's;
 * - Ride Down: the attackers it blocked gain trample, though it's destroyed
 *   first; another attacker doesn't;
 * - Triton Tactics: only what each target blocked, and they stay tapped;
 * - `of: "source"`, and the relation with no partner at all.
 */

import { describe, expect, it } from "vitest";

import type { BlockerDeclaration } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  keywords,
  lands,
  nextTurn,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

const LEGEND_BLOCK = { blockedThisTurn: { relation: "either", partner: { supertype: "legendary" } } } as const;

const asks = (game: Game, id: ObjectId, filter: Parameters<typeof matchesFilter>[3]): boolean =>
  matchesFilter(game.state, registryOf(game), id, filter, { you: A });

/** Alice's main phase after a combat of `attackers`, Bob blocking by `pairs`. */
function fight(
  seats: ReturnType<typeof table>,
  attackers: readonly ObjectId[],
  ...pairs: readonly (readonly [ObjectId, ObjectId])[]
): void {
  seats.b.declareBlockersFn = blocks(...pairs);
  attack(seats.game, seats.a, attackers);
}

/** Alice holds priority in her declare blockers step, the stack empty. */
const toBlocks = (game: Game): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null && s.zones.shared.stack.length === 0,
  );

describe("You Cannot Pass!", () => {
  it("destroys a creature that blocked a legendary creature, after combat", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [legend], [wall, legend]);
    expect(game.state.turn.step).toBe("postcombat-main");
    spawn(game, "Plains");
    cast(game, toHand(game, "You Cannot Pass!"), { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("destroys a creature blocked by a legendary creature, the legend gone", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    seats.b.declareBlockersFn = blocks([legend, bears]);
    seats.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toBlocks(game);
    // The legend leaves before damage; the bears stay blocked, and were.
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(legend)]);
    settle(game);
    expect(zone(game, legend)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    spawn(game, "Plains");
    cast(game, toHand(game, "You Cannot Pass!"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("refuses a creature whose block was with no legend, or that didn't block", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const bystander = spawn(game, "Wall of Wood", B);
    fight(seats, [legend, bears], [wall, bears]);
    spawn(game, "Plains");
    const spell = toHand(game, "You Cannot Pass!");
    expect(() => cast(game, spell, { targets: [ref(wall)] })).toThrow();
    expect(() => cast(game, spell, { targets: [ref(bystander)] })).toThrow();
    expect(() => cast(game, spell, { targets: [ref(legend)] })).toThrow();
  });

  it("the history lapses with the turn", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [legend], [wall, legend]);
    expect(asks(game, wall, LEGEND_BLOCK)).toBe(true);
    nextTurn(game);
    expect(asks(game, wall, LEGEND_BLOCK)).toBe(false);
  });
});

describe("the block as it was", () => {
  it("asks what the other creature was at the block, not what it has become", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood", B);
    const other = spawn(game, "Wall of Wood", B);
    fight(seats, [bears, elf], [wall, bears], [other, elf]);
    const blue = { blockedThisTurn: { relation: "either", partner: { colors: ["U"] } } } as const;
    const green = { blockedThisTurn: { relation: "either", partner: { colors: ["G"] } } } as const;
    // Bears were green at the block. Turned blue now, they still were.
    game.debugApplyEffect(A, { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(asks(game, wall, green)).toBe(true);
    expect(asks(game, wall, blue)).toBe(false);
  });

  it("a creature that left the battlefield and came back never blocked (rule 400.7)", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [legend], [wall, legend]);
    expect(asks(game, wall, LEGEND_BLOCK)).toBe(true);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(wall)]);
    settle(game);
    expect(zone(game, wall)).toBe("battlefield");
    expect(asks(game, wall, LEGEND_BLOCK)).toBe(false);
    // And the same of the other side: the legend's record is of the old wall.
    expect(asks(game, legend, { blockedThisTurn: { relation: "blocked-by" } })).toBe(true);
  });

  it("reads a band's block whole (rule 702.22h)", () => {
    const seats = table({ deck: "Plains" });
    const { game, a, b } = seats;
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    a.declareAttackersFn = () => [
      { attacker: hero, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
    ];
    b.declareBlockersFn = blocks([wall, hero]);
    toBlocks(game);
    expect(asks(game, hero, { blockedThisTurn: { relation: "blocked-by" } })).toBe(true);
    expect(asks(game, bears, { blockedThisTurn: { relation: "blocked-by" } })).toBe(true);
    expect(asks(game, wall, { blockedThisTurn: { relation: "blocked" } })).toBe(true);
    expect(asks(game, wall, { blockedThisTurn: { relation: "blocked-by" } })).toBe(false);
  });
});

describe("Sea Troll", () => {
  it("can regenerate only after a block with a blue creature, either way", () => {
    const seats = table({ deck: "Island" });
    const { game } = seats;
    const troll = spawn(game, "Sea Troll");
    lands(game, "Island", 2);
    const canRegenerate = (): boolean => game.canDispatch({
      type: "activate-ability",
      player: A,
      source: troll,
      abilityIndex: 0,
      targets: [],
    }) === null;
    expect(canRegenerate()).toBe(false);
    const blue = spawn(game, "Wall of Air", B);
    seats.b.declareBlockersFn = blocks([blue, troll]);
    seats.a.declareAttackersFn = () => [{ attacker: troll, defender: B }];
    toBlocks(game);
    expect(canRegenerate()).toBe(true);
    activate(game, troll, 0);
    expect(game.state.objects[troll].regenerationShields).toBe(1);
    // Wall of Air's 1 would kill the 2/1; the shield saves it.
    toStep(game, "postcombat-main");
    expect(zone(game, troll)).toBe("battlefield");
    expect(game.state.objects[troll].tapped).toBe(true);
  });

  it("a block with a creature of another color doesn't open it", () => {
    const seats = table({ deck: "Island" });
    const { game } = seats;
    const troll = spawn(game, "Sea Troll");
    lands(game, "Island", 2);
    const green = spawn(game, "Wall of Wood", B);
    fight(seats, [troll], [green, troll]);
    const why = game.canDispatch({ type: "activate-ability", player: A, source: troll, abilityIndex: 0, targets: [] });
    expect(why).not.toBeNull();
  });
});

describe("Venomous Breath", () => {
  it("destroys both sides of the target's blocks at end of combat", () => {
    const seats = table({ deck: "Forest" });
    const { game } = seats;
    lands(game, "Forest", 4);
    const breath = toHand(game, "Venomous Breath");
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const bystander = spawn(game, "Wall of Wood", B);
    cast(game, breath, { targets: [ref(wall)] });
    seats.b.declareBlockersFn = blocks([wall, bears], [bystander, elf]);
    attack(game, seats.a, [bears, elf]);
    // The bears were blocked by the target: destroyed, as it had survived.
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    // The elf's block wasn't with it.
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("still fires with the target gone, and doesn't fizzle", () => {
    const seats = table({ deck: "Forest" });
    const { game } = seats;
    lands(game, "Forest", 4);
    const giant = spawn(game, "Hill Giant");
    const wall = spawn(game, "Wall of Wood", B);
    const gnat = spawn(game, "Llanowar Elves", B);
    const breath = toHand(game, "Venomous Breath");
    cast(game, breath, { targets: [ref(gnat)] });
    // Hill Giant's 3 kills the elf, the target; at end of combat the giant,
    // blocked by the target, is destroyed.
    seats.b.declareBlockersFn = blocks([gnat, giant]);
    attack(game, seats.a, [giant]);
    expect(zone(game, gnat)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    // A creature that wasn't in a block with the target stays.
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("cast after combat, there's no end of combat left this turn: it lapses", () => {
    const seats = table({ deck: "Forest" });
    const { game } = seats;
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [bears], [wall, bears]);
    expect(game.state.turn.step).toBe("postcombat-main");
    cast(game, toHand(game, "Venomous Breath"), { targets: [ref(wall)] });
    expect(game.state.delayedTriggers.length).toBe(1);
    nextTurn(game);
    expect(game.state.delayedTriggers.length).toBe(0);
    // Bob's turn's own combat: nothing fires.
    toStep(game, "end", B);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a creature that left and came back is no longer 'it' (rule 400.7)", () => {
    const seats = table({ deck: "Forest" });
    const { game } = seats;
    lands(game, "Forest", 4);
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Venomous Breath"), { targets: [ref(wall)] });
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(wall)]);
    settle(game);
    // The new wall blocks: it isn't the creature the spell meant.
    seats.b.declareBlockersFn = blocks([wall, bears]);
    attack(game, seats.a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Ride Down", () => {
  it("destroys the blocker, and only what it blocked gains trample", () => {
    const seats = table({ deck: "Mountain" });
    const { game } = seats;
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood", B);
    const other = spawn(game, "Wall of Wood", B);
    seats.b.declareBlockersFn = blocks([wall, bears], [other, elf]);
    seats.a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: elf, defender: B },
    ];
    toBlocks(game);
    const before = game.state.players[B].life;
    cast(game, toHand(game, "Ride Down"), { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, elf).has("trample")).toBe(false);
    toStep(game, "postcombat-main");
    // With no creature left blocking it, it assigns it all to Bob (702.19d).
    expect(game.state.players[B].life).toBe(before - 2);
  });
});

describe("Triton Tactics", () => {
  it("taps what the targets blocked, and leaves what blocked them", () => {
    const seats = table({ deck: "Island" });
    const { game, a, b } = seats;
    lands(game, "Island", 1);
    const wall = spawn(game, "Wall of Wood", B);
    const attackerOne = spawn(game, "Grizzly Bears", A);
    const attackerTwo = spawn(game, "Llanowar Elves", A);
    const free = spawn(game, "Elvish Mystic", A);
    const spell = toHand(game, "Triton Tactics");
    b.declareBlockersFn = blocks([wall, attackerOne]);
    a.declareAttackersFn = () => [
      { attacker: attackerOne, defender: B },
      { attacker: attackerTwo, defender: B },
      { attacker: free, defender: B },
    ];
    toBlocks(game);
    cast(game, spell, { targets: [ref(wall), null] });
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 6 });
    game.advanceUntil((s) => s.turn.step === "end-combat" && s.zones.shared.stack.length === 0 && s.priority.holder === A);
    settle(game);
    expect(game.state.objects[attackerOne].tapped).toBe(true);
    expect(game.state.objects[wall].tapped).toBe(false);
    // Doesn't untap during Alice's next untap step; the one not blocked does.
    nextTurn(game);
    nextTurn(game);
    expect(game.activePlayer).toBe(A);
    expect(game.state.objects[attackerOne].tapped).toBe(true);
    expect(game.state.objects[attackerTwo].tapped).toBe(false);
  });

  it("with no targets, sets up nothing to tap", () => {
    const seats = table({ deck: "Island" });
    const { game } = seats;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Triton Tactics"), { targets: [null, null] });
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [bears], [wall, bears]);
    expect(game.state.objects[wall].tapped).toBe(false);
  });
});

describe("Sizzling Barrage", () => {
  it("hits a creature that blocked, and refuses one that was blocked", () => {
    const seats = table({ deck: "Mountain" });
    const { game } = seats;
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [bears], [wall, bears]);
    const spell = toHand(game, "Sizzling Barrage");
    expect(() => cast(game, spell, { targets: [ref(bears)] })).toThrow();
    cast(game, spell, { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
  });
});

describe("Joven's Ferrets", () => {
  it("taps the creatures that blocked it, and they stay tapped through their next untap step", () => {
    const seats = table({ deck: "Forest" });
    const { game } = seats;
    const ferrets = spawn(game, "Joven's Ferrets");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const other = spawn(game, "Wall of Wood", B);
    fight(seats, [ferrets, bears], [wall, ferrets], [other, bears]);
    expect(zone(game, ferrets)).toBe("battlefield");
    expect(game.state.objects[wall].tapped).toBe(true);
    expect(game.state.objects[other].tapped).toBe(false);
    nextTurn(game);
    expect(game.activePlayer).toBe(B);
    expect(game.state.objects[wall].tapped).toBe(true);
  });
});

describe("this combat only", () => {
  it("doesn't reach an earlier combat phase's blocks", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    fight(seats, [bears], [wall, bears]);
    const thisCombat = { blockedThisTurn: { relation: "blocked", thisCombat: true } } as const;
    expect(asks(game, wall, thisCombat)).toBe(true);
    // As a second combat phase of the turn would have it.
    game.state.turn.combatPhases = (game.state.turn.combatPhases ?? 0) + 1;
    expect(asks(game, wall, thisCombat)).toBe(false);
    expect(asks(game, wall, { blockedThisTurn: { relation: "blocked" } })).toBe(true);
  });
});

describe("a bare relation, and a source partner", () => {
  it("reads 'blocked this turn' with no partner, each way", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const free = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood", B);
    const idle = spawn(game, "Wall of Wood", B);
    fight(seats, [bears, free], [wall, bears]);
    const blocked = { blockedThisTurn: { relation: "blocked" } } as const;
    const wasBlocked = { blockedThisTurn: { relation: "blocked-by" } } as const;
    expect(asks(game, wall, blocked)).toBe(true);
    expect(asks(game, wall, wasBlocked)).toBe(false);
    expect(asks(game, bears, wasBlocked)).toBe(true);
    expect(asks(game, bears, blocked)).toBe(false);
    expect(asks(game, free, wasBlocked)).toBe(false);
    expect(asks(game, idle, blocked)).toBe(false);
  });

  it("binds 'source' to the ability's permanent; a clause nothing bound matches nothing", () => {
    const seats = table({ deck: "Plains" });
    const { game } = seats;
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood", B);
    const other = spawn(game, "Wall of Wood", B);
    fight(seats, [bears, elf], [wall, bears], [other, elf]);
    expect(asks(game, wall, { blockedThisTurn: { relation: "blocked", of: "source" } })).toBe(false);
    const tapThem: EffectSpec = {
      kind: "tap-all",
      filter: { type: "creature", blockedThisTurn: { relation: "blocked", of: "source" } },
    };
    game.debugApplyEffect(A, tapThem, [], { source: bears });
    settle(game);
    expect(game.state.objects[wall].tapped).toBe(true);
    expect(game.state.objects[other].tapped).toBe(false);
  });
});
