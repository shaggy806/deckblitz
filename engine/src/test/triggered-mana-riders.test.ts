/**
 * Triggered mana abilities (rule 605.1b) that read a condition or do more than
 * add mana: the whole ability happens at once, off the stack (rule 605.4a), by
 * hand or paying a cost. Overabundance, Barbflare Gremlin, Winter's Night,
 * Regal Behemoth, Gauntlet of Power. And what isn't one: Crime Novelist, which
 * triggers from neither a mana ability nor mana being added (rule 605.5a).
 * Desolation's "each player who tapped a land for mana this turn" and Hall of
 * the Bandit Lord's lasting haste ride along.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickPermanents,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const pool = (game: Game, player = A): readonly string[] => game.state.players[player].manaPool.map((u) => u.type);
const tap = (game: Game, source: ObjectId, player = A, index = 0): void =>
  activate(game, source, index, { player, settle: false });

describe("a triggered mana ability that does more than add mana", () => {
  it("Overabundance: by hand, the mana and the damage come at once, off the stack", () => {
    const { game } = table();
    spawn(game, "Overabundance");
    const [forest] = lands(game, "Forest", 1);
    tap(game, forest);
    expect(pool(game)).toEqual(["G", "G"]);
    expect(life(game)).toBe(19);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.pendingTriggers).toHaveLength(0);
  });

  it("Overabundance: paying a cost, the extra mana pays and each land tapped deals its damage", () => {
    const { game } = table();
    spawn(game, "Overabundance");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(zone(game, bears)).toBe("stack");
    expect(game.state.zones.shared.stack).toEqual([bears]);
    expect(life(game)).toBe(19);
  });

  it("Overabundance: 'that player' is whoever tapped the land, and the enchantment deals it", () => {
    const { game } = table();
    const abundance = spawn(game, "Overabundance");
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    tap(game, mountain, B);
    expect(pool(game, B)).toEqual(["R", "R"]);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.source === abundance);
    expect(dealt).toHaveLength(1);
  });

  it("Overabundance: a source that isn't a land sets nothing off", () => {
    const { game } = table();
    spawn(game, "Overabundance");
    const elves = spawn(game, "Llanowar Elves");
    tap(game, elves);
    expect(pool(game)).toEqual(["G"]);
    expect(life(game)).toBe(20);
  });

  it("Barbflare Gremlin: untapped, nothing; tapped, the mana, then the land deals the damage", () => {
    const { game } = table();
    const gremlin = spawn(game, "Barbflare Gremlin");
    const [one, two] = lands(game, "Mountain", 2);
    tap(game, one);
    expect(pool(game)).toEqual(["R"]);
    expect(life(game)).toBe(20);
    game.state.objects[gremlin].tapped = true;
    tap(game, two);
    expect(pool(game)).toEqual(["R", "R", "R"]);
    expect(life(game)).toBe(19);
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.source === two);
    expect(dealt).toHaveLength(1);
  });

  it("Barbflare Gremlin: a land sacrificed for its mana still deals the damage, as it last was (608.2h)", () => {
    const { game } = table();
    spawn(game, "Barbflare Gremlin", A, { tapped: true });
    const vein = spawn(game, "Crystal Vein");
    tap(game, vein, A, 1);
    expect(zone(game, vein)).toBe("graveyard");
    expect(pool(game)).toEqual(["C", "C", "C"]);
    expect(life(game)).toBe(19);
  });

  it("Barbflare Gremlin: paying a cost, the plan sees the condition", () => {
    const { game } = table();
    spawn(game, "Barbflare Gremlin", A, { tapped: true });
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(game.state.zones.shared.stack).toEqual([bears]);
    expect(life(game)).toBe(19);
  });

  it("Winter's Night: a snow land doesn't untap next time, and a plain land is left alone", () => {
    const { game } = table();
    spawn(game, "Winter's Night");
    const [snow] = lands(game, "Snow-Covered Forest", 1);
    const [plain] = lands(game, "Forest", 1);
    tap(game, snow);
    expect(pool(game)).toEqual(["G", "G"]);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    tap(game, plain);
    expect(pool(game)).toEqual(["G", "G", "G"]);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[snow].tapped).toBe(true);
    expect(game.state.objects[plain].tapped).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[snow].tapped).toBe(false);
  });

  it("Winter's Night: paying a cost, the land still won't untap", () => {
    const { game } = table();
    spawn(game, "Winter's Night");
    const [snow] = lands(game, "Snow-Covered Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[snow].tapped).toBe(true);
  });
});

describe("a triggered mana ability with a condition", () => {
  it("Regal Behemoth: while its controller is the monarch, and not once they aren't", () => {
    const { game } = table();
    const [one, two] = lands(game, "Forest", 2);
    enter(game, "Regal Behemoth");
    expect(game.state.monarch).toBe(A);
    tap(game, one);
    expect(pool(game)).toHaveLength(2);
    game.state.monarch = B;
    tap(game, two);
    expect(pool(game)).toHaveLength(3);
  });

  it("Regal Behemoth: paying a cost, the extra mana pays while monarch", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    enter(game, "Regal Behemoth");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    game.state.monarch = B;
    lands(game, "Forest", 1);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: toHand(game, "Grizzly Bears"), targets: [] })).not.toBeNull();
  });
});

describe("a triggered mana ability on mana of the chosen colour", () => {
  it("Gauntlet of Power: basic lands of that colour, any player's; creatures of that colour, anyone's", () => {
    const { game } = table();
    const gauntlet = spawn(game, "Gauntlet of Power");
    game.state.objects[gauntlet].chosenOnEnter = "G";
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin");
    expect(pt(game, mine).power).toBe(3);
    expect(pt(game, theirs).power).toBe(3);
    expect(pt(game, goblin).power).toBe(1);
    const [forest] = lands(game, "Forest", 1);
    const [mountain] = lands(game, "Mountain", 1);
    tap(game, forest);
    expect(pool(game)).toEqual(["G", "G"]);
    tap(game, mountain);
    expect(pool(game)).toEqual(["G", "G", "R"]);
    nextTurn(game);
    const [bForest] = lands(game, "Forest", 1, B);
    tap(game, bForest, B);
    expect(pool(game, B)).toEqual(["G", "G"]);
  });

  it("Gauntlet of Power: a nonbasic land of that colour, nothing", () => {
    const { game } = table();
    const gauntlet = spawn(game, "Gauntlet of Power");
    game.state.objects[gauntlet].chosenOnEnter = "G";
    const temple = spawn(game, "Karplusan Forest");
    expect(game.state.objects[temple].tapped).toBe(false);
    tap(game, temple, A, 1);
    expect(pool(game)).toHaveLength(1);
  });

  it("Gauntlet of Power: with no colour chosen, it never triggers (the ruling)", () => {
    const { game } = table();
    spawn(game, "Gauntlet of Power");
    const [forest] = lands(game, "Forest", 1);
    tap(game, forest);
    expect(pool(game)).toEqual(["G"]);
  });

  it("Gauntlet of Power: paying a cost, the extra mana pays", () => {
    const { game } = table();
    const gauntlet = spawn(game, "Gauntlet of Power");
    game.state.objects[gauntlet].chosenOnEnter = "G";
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("not a mana ability", () => {
  it("Crime Novelist: the counter and the {R} use the stack, and can be responded to (605.5a)", () => {
    const { game } = table();
    const novelist = spawn(game, "Crime Novelist");
    const treasure = game.debugSpawn("Treasure Token", A, "battlefield", { summoningSick: false });
    activate(game, treasure, 0, { settle: false });
    expect(pool(game)).toHaveLength(1);
    expect(counters(game, novelist)).toBe(0);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(counters(game, novelist)).toBe(1);
    expect(pool(game)).toContain("R");
    expect(pool(game)).toHaveLength(2);
  });

  it("Crime Novelist: an opponent's sacrifice, or a creature, isn't one", () => {
    const { game } = table();
    const novelist = spawn(game, "Crime Novelist");
    nextTurn(game);
    const treasure = game.debugSpawn("Treasure Token", B, "battlefield", { summoningSick: false });
    activate(game, treasure, 0, { player: B });
    expect(counters(game, novelist)).toBe(0);
  });
});

describe("Desolation: each player who tapped a land for mana this turn", () => {
  it("sacrifices a land of their choice; Plains deal 2; a player who tapped none, nothing", () => {
    const { game, a, b } = table();
    spawn(game, "Desolation");
    const [plains, spare] = lands(game, "Plains", 2);
    const bLands = lands(game, "Mountain", 2, B);
    tap(game, plains);
    pickPermanents(a, plains);
    pickPermanents(b, bLands[0]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, spare)).toBe("battlefield");
    expect(life(game)).toBe(18);
    expect(graveyard(game, B)).toHaveLength(0);
    expect(life(game, B)).toBe(20);
  });

  it("a player who sacrificed something else takes no damage, by the auto-payer too, and it's each end step", () => {
    const { game, a, b } = table();
    spawn(game, "Desolation");
    const [forest] = lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Llanowar Elves"));
    pickPermanents(a, forest);
    toStep(game, "end");
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(life(game)).toBe(20);
    // A new turn: nobody has tapped one. Bob now does, on his own turn.
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    tap(game, mountain, B);
    pickPermanents(b, mountain);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(named(game, "Plains", A)).toHaveLength(1);
  });
});

describe("Hall of the Bandit Lord: haste for good", () => {
  it("pays 3 life, and a creature cast with its {C} keeps haste on later turns", () => {
    const { game } = table();
    const hall = spawn(game, "Hall of the Bandit Lord");
    game.state.objects[hall].tapped = false;
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    tap(game, hall);
    expect(life(game)).toBe(17);
    expect(pool(game)).toEqual(["C"]);
    cast(game, bears);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("enters tapped", () => {
    const { game } = table();
    const hall = enter(game, "Hall of the Bandit Lord");
    expect(game.state.objects[hall].tapped).toBe(true);
  });
});
