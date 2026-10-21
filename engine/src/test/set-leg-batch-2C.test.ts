/**
 * Legends, batch 2, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  nextTurn,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
/** `source` deals 2 damage to each of its controller's opponents. */
const ping = (game: Game, source: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, who: "each-opponent" }, [], {
    source,
  });

describe("Elven Riders", () => {
  it("can be blocked only by Walls and fliers — not by a reach creature", () => {
    const { game, a } = table();
    const riders = spawn(game, "Elven Riders");
    const wall = spawn(game, "Wall of Wood", B);
    const drake = spawn(game, "Wind Drake", B);
    const spider = spawn(game, "Giant Spider", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [riders]);
    expect(canBlock(offer, wall)).toContain(riders);
    expect(canBlock(offer, drake)).toContain(riders);
    expect(canBlock(offer, spider)).not.toContain(riders);
    expect(canBlock(offer, bears)).not.toContain(riders);
  });
});

describe("Seeker", () => {
  it("lets only artifact and/or white creatures block the enchanted creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Seeker"), { targets: [ref(bears)] });
    const thopter = spawn(game, "Ornithopter", B);
    const lions = spawn(game, "Savannah Lions", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, thopter)).toContain(bears);
    expect(canBlock(offer, lions)).toContain(bears);
    expect(canBlock(offer, theirBears)).not.toContain(bears);
  });
});

describe("Spectral Cloak", () => {
  it("gives shroud only while the enchanted creature is untapped", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Spectral Cloak"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("shroud")).toBe(true);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(bears)]);
    expect(tapped(game, bears)).toBe(true);
    expect(keywords(game, bears).has("shroud")).toBe(false);
  });
});

describe("Greater Realm of Preservation", () => {
  it("offers black and red sources, not green ones, and prevents the chosen one's next damage", () => {
    const { game, a } = table();
    const realm = spawn(game, "Greater Realm of Preservation");
    lands(game, "Plains", 2);
    const knight = spawn(game, "Black Knight", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const seen = pickPermanents(a, knight);
    activate(game, realm, 0);
    expect(seen.offered).toContain(knight);
    expect(seen.offered).toContain(goblin);
    expect(seen.offered).not.toContain(elves);
    ping(game, knight);
    expect(life(game, A)).toBe(20);
    ping(game, knight);
    expect(life(game, A)).toBe(18);
  });
});

describe("Elder Land Wurm", () => {
  it("loses defender once it has blocked", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Elder Land Wurm");
    expect(keywords(game, wurm).has("defender")).toBe(true);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: wurm, attacker: bears }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === B);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, wurm).has("defender")).toBe(false);
    expect(keywords(game, wurm).has("trample")).toBe(true);
  });
});

describe("Cyclopean Mummy", () => {
  it("is exiled from the graveyard when it dies", () => {
    const { game } = table();
    const mummy = spawn(game, "Cyclopean Mummy");
    destroy(game, mummy);
    expect(zone(game, mummy)).toBe("exile");
  });
});

describe("Venarian Gold", () => {
  it("taps the creature with X sleep counters; it stays tapped until the last one is removed in its controller's upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Venarian Gold"), { targets: [ref(bears)], x: 2 });
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "sleep")).toBe(2);
    nextTurn(game); // bob's: doesn't untap (2 counters), upkeep removes one
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "sleep")).toBe(1);
    nextTurn(game); // alice's upkeep: not the enchanted creature's controller's
    expect(counters(game, bears, "sleep")).toBe(1);
    nextTurn(game); // bob's: still a counter at untap, the last removed in upkeep
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "sleep")).toBe(0);
    nextTurn(game);
    nextTurn(game); // bob's: no counters left, so it untaps
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Ichneumon Druid", () => {
  it("punishes an opponent's second instant each turn, not their first", () => {
    const { game } = table();
    spawn(game, "Ichneumon Druid");
    lands(game, "Island", 2, B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Opt", B), { player: B });
    expect(life(game, B)).toBe(20);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Opt", B), { player: B, settle: false });
    settle(game);
    expect(life(game, B)).toBe(16);
  });
});
