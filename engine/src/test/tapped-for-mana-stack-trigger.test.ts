/**
 * A "whenever … is tapped for mana" trigger that isn't a mana ability (rule
 * 605.1b: it does something else, or it has a target): it triggers as the mana
 * ability resolves and produces mana (rule 106.12a) and goes on the stack the
 * next time a player would get priority (rule 603.3), above a spell the mana
 * paid for. By hand or by the auto-payer. Manabarbs, Burning Earth, Zhur-Taa
 * Druid, Forbidden Orchard, Storm Cauldron, Sanctimony.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const manaOf = (game: Game, player = A): number => game.state.players[player].manaPool.length;

/** Tap `source`'s first ability by hand, without resolving what triggers. */
const tap = (game: Game, source: ObjectId, player = A): void => activate(game, source, 0, { player, settle: false });

describe("a tapped-for-mana trigger that uses the stack", () => {
  it("Manabarbs: tapped by hand, it goes on the stack, the mana already made", () => {
    const { game } = table();
    spawn(game, "Manabarbs");
    const [mountain] = lands(game, "Mountain", 1);
    tap(game, mountain);
    expect(manaOf(game)).toBe(1);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(life(game)).toBe(20);
    settle(game);
    expect(life(game)).toBe(19);
  });

  it("Manabarbs: tapped paying for a spell, one trigger a land, above the spell", () => {
    const { game } = table();
    spawn(game, "Manabarbs");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const stack = game.state.zones.shared.stack;
    expect(stack).toHaveLength(3);
    expect(stack[0]).toBe(bears);
    expect(zone(game, bears)).toBe("stack");
    settle(game);
    expect(life(game)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Manabarbs: 'that player' is whoever tapped it, not Manabarbs' controller", () => {
    const { game } = table();
    spawn(game, "Manabarbs");
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(game.state.objects[mountain].tapped).toBe(true);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(17);
  });

  it("Manabarbs: an artifact tapped for mana isn't a land, and a land merely tapped isn't for mana", () => {
    const { game } = table();
    spawn(game, "Manabarbs");
    const sol = spawn(game, "Sol Ring");
    tap(game, sol);
    expect(manaOf(game)).toBe(2);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    const [other] = lands(game, "Mountain", 1, B);
    const icy = spawn(game, "Icy Manipulator");
    // Paid from the mana Sol Ring left in the pool.
    activate(game, icy, 0, { targets: [ref(other)] });
    expect(game.state.objects[other].tapped).toBe(true);
    expect(life(game)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("Manabarbs: a land sacrificed for its mana was still a land", () => {
    const { game } = table();
    spawn(game, "Manabarbs");
    const [vein] = lands(game, "Crystal Vein", 1);
    activate(game, vein, 1);
    expect(zone(game, vein)).toBe("graveyard");
    expect(life(game)).toBe(19);
    expect(manaOf(game)).toBe(2);
  });

  it("Burning Earth: a nonbasic land sets it off, and a basic doesn't", () => {
    const { game } = table();
    spawn(game, "Burning Earth");
    const [basic] = lands(game, "Mountain", 1);
    const [other] = lands(game, "Taiga", 1);
    tap(game, basic);
    settle(game);
    expect(life(game)).toBe(20);
    tap(game, other);
    settle(game);
    expect(life(game)).toBe(19);
  });

  it("Zhur-Taa Druid: its own tap, 1 to each opponent, and its mana still pays", () => {
    const { game } = table({ players: 3 });
    const druid = spawn(game, "Zhur-Taa Druid");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(game.state.objects[druid].tapped).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    expect(life(game, "carol" as typeof A)).toBe(19);
    expect(life(game)).toBe(20);
  });

  it("Zhur-Taa Druid: another creature tapped for mana doesn't set it off", () => {
    const { game } = table();
    spawn(game, "Zhur-Taa Druid");
    const elves = spawn(game, "Llanowar Elves");
    tap(game, elves);
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("Forbidden Orchard: the opponent you target gets the Spirit", () => {
    const { game, a } = table({ players: 3 });
    const orchard = spawn(game, "Forbidden Orchard");
    pickTargets(a, B);
    tap(game, orchard);
    settle(game);
    expect(tokensNamed(game, "Spirit Token (Colorless)", B)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(0);
    expect(manaOf(game)).toBe(1);
  });

  it("Storm Cauldron: the mana stays, the land goes to its owner's hand", () => {
    const { game } = table();
    spawn(game, "Storm Cauldron");
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(hand(game, B)).toContain(mountain);
    expect(zone(game, mountain)).toBe("hand");
  });

  it("Storm Cauldron: a land gone before it resolves is left where it went", () => {
    const { game } = table();
    spawn(game, "Storm Cauldron");
    const [mountain] = lands(game, "Mountain", 1);
    tap(game, mountain);
    destroy(game, mountain);
    settle(game);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(manaOf(game)).toBe(1);
  });

  it("Sanctimony: an opponent's Mountain, you may gain; your own Mountain and their Forest do nothing", () => {
    const { game, a } = table();
    spawn(game, "Sanctimony");
    const [mine] = lands(game, "Mountain", 1);
    tap(game, mine);
    settle(game);
    expect(life(game)).toBe(20);
    nextTurn(game);
    pickModes(a, 0);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(B)] });
    expect(life(game)).toBe(21);
    // Declined.
    pickModes(a);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(B)] });
    expect(life(game)).toBe(21);
    // Not a Mountain.
    pickModes(a, 0);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(life(game)).toBe(21);
  });

  it("no mana made, nothing triggers (rule 106.12a)", () => {
    const { game } = table();
    spawn(game, "Burning Earth");
    // A Reflecting Pool with nothing to reflect makes no mana.
    const [pool] = lands(game, "Reflecting Pool", 1);
    game.dispatch({ type: "activate-ability", player: A, source: pool, abilityIndex: 0, targets: [] });
    settle(game);
    expect(life(game)).toBe(20);
    expect(named(game, "Reflecting Pool", A)).toEqual([pool]);
  });
});

describe("a triggered mana ability still doesn't use the stack", () => {
  it("Crypt Ghast: the extra {B} comes at once, and nothing goes on the stack", () => {
    const { game } = table();
    spawn(game, "Crypt Ghast");
    const [swamp] = lands(game, "Swamp", 1);
    tap(game, swamp);
    expect(manaOf(game)).toBe(2);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});
