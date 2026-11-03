/**
 * Tokens that remember the permanent they were created with
 * (`GameObject.createdWith`, `linkedToSource`), read by the filter clause
 * `createdWithSource` and the count `countersOnMaker`: Saproling Burst, Faerie
 * Artisans, Arcane Artisan. Mysterio's "those tokens" is the delayed trigger over
 * what its resolution made, Stangg's shape, with several tokens.
 */

import { describe, expect, it } from "vitest";

import { tokenFoldKey } from "../state.js";
import {
  A,
  B,
  activate,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const SAPROLING = "Saproling Token (Saproling Burst)";

/** The tokens on the battlefield with this name. */
const onBattlefield = (game: Game, name: string): ObjectId[] =>
  named(game, name).filter((id) => zone(game, id) === "battlefield");

/** Bounce a permanent: it leaves, with none of a death's side effects. */
const toOwnersHand = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Saproling Burst", () => {
  const burst = (game: Game): ObjectId => enter(game, "Saproling Burst");

  it("enters with seven fade counters, each activation a token reading what's left", () => {
    const { game } = table();
    const it = burst(game);
    expect(counters(game, it, "fade")).toBe(7);
    activate(game, it);
    const [first] = onBattlefield(game, SAPROLING);
    expect(pt(game, first)).toEqual({ power: 6, toughness: 6 });
    activate(game, it);
    expect(onBattlefield(game, SAPROLING).map((id) => pt(game, id).power)).toEqual([5, 5]);
  });

  it("a token knows which Saproling Burst it came from (the ruling)", () => {
    const { game } = table();
    const one = burst(game);
    const two = burst(game);
    activate(game, one);
    activate(game, two);
    activate(game, two);
    const [fromOne, ...fromTwo] = onBattlefield(game, SAPROLING);
    expect(pt(game, fromOne).power).toBe(6);
    expect(fromTwo.map((id) => pt(game, id).power)).toEqual([5, 5]);
    expect(tokenFoldKey(game.state.objects[fromOne])).not.toBe(tokenFoldKey(game.state.objects[fromTwo[0]]));
    // Its leaving takes its own tokens only.
    destroy(game, two);
    expect(onBattlefield(game, SAPROLING)).toEqual([fromOne]);
  });

  it("destroys what it created when it leaves, past +1/+1 counters and regeneration", () => {
    const { game } = table();
    const it = burst(game);
    activate(game, it);
    const [token] = onBattlefield(game, SAPROLING);
    // Big enough to outlast its 0/0, and with a shield that can't help it.
    game.state.objects[token].counters["+1/+1"] = 2;
    game.state.objects[token].regenerationShields = 1;
    toOwnersHand(game, it);
    expect(onBattlefield(game, SAPROLING)).toEqual([]);
    expect(tokensNamed(game, SAPROLING)).toBe(0);
  });

  it("a copy of the token wasn't created with it: it reads no counters and dies", () => {
    const { game } = table();
    const it = burst(game);
    activate(game, it);
    const [token] = onBattlefield(game, SAPROLING);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(token)]);
    settle(game);
    const copy = onBattlefield(game, SAPROLING).find((id) => id !== token);
    if (copy !== undefined) {
      expect(game.state.objects[copy].createdWith).toBeUndefined();
      expect(pt(game, copy)).toEqual({ power: 0, toughness: 0 });
    }
    expect(game.state.objects[token].createdWith?.source).toBe(it);
    expect(pt(game, token).power).toBe(6);
    activate(game, it);
    expect(onBattlefield(game, SAPROLING).length).toBe(2);
  });

  it("the tokens it made fold at cleanup into a stack, and the stack still goes with it", () => {
    const { game } = table();
    const it = burst(game);
    activate(game, it);
    activate(game, it);
    nextTurn(game);
    expect(tokensNamed(game, SAPROLING)).toBe(2);
    destroy(game, it);
    expect(tokensNamed(game, SAPROLING)).toBe(0);
  });
});

describe("Gutter Grime", () => {
  const OOZE = "Ooze Token (Gutter Grime)";

  it("each Ooze reads the slime counters on the one that made it, updating, and dies with it", () => {
    const { game } = table();
    const one = spawn(game, "Gutter Grime");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(counters(game, one, "slime")).toBe(1);
    const [ooze] = onBattlefield(game, OOZE);
    expect(pt(game, ooze)).toEqual({ power: 1, toughness: 1 });
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(pt(game, ooze)).toEqual({ power: 2, toughness: 2 });
    expect(onBattlefield(game, OOZE).length).toBe(2);
    toOwnersHand(game, one);
    expect(pt(game, ooze)).toEqual({ power: 0, toughness: 0 });
    toStep(game, "end");
    expect(onBattlefield(game, OOZE)).toEqual([]);
  });

  it("a token's own death doesn't feed it", () => {
    const { game } = table();
    const one = spawn(game, "Gutter Grime");
    destroy(game, spawn(game, "Grizzly Bears"));
    const [ooze] = onBattlefield(game, OOZE);
    destroy(game, ooze);
    expect(counters(game, one, "slime")).toBe(1);
  });
});

describe("Faerie Artisans", () => {
  it("copies what an opponent's nontoken creature is, as an artifact too, and exiles the last one", () => {
    const { game } = table();
    enter(game, "Faerie Artisans");
    enter(game, "Grizzly Bears", B);
    const [firstCopy] = named(game, "Grizzly Bears", A);
    expect(types(game, firstCopy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    enter(game, "Hill Giant", B);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
  });

  it("a second copy of one card leaves the new token and exiles the old", () => {
    const { game } = table();
    enter(game, "Faerie Artisans");
    enter(game, "Grizzly Bears", B);
    const [old] = named(game, "Grizzly Bears", A);
    enter(game, "Grizzly Bears", B);
    const mine = onBattlefield(game, "Grizzly Bears").filter((id) => game.state.objects[id].controller === A);
    expect(mine.length).toBe(1);
    expect(mine).not.toContain(old);
  });

  it("each exiles only its own (the ruling), and a token from elsewhere stays", () => {
    const { game } = table();
    const one = enter(game, "Faerie Artisans");
    enter(game, "Grizzly Bears", B);
    enter(game, "Faerie Artisans");
    enter(game, "Hill Giant", B);
    // The first made Bears, then a Giant, exiling the Bears; the second a Giant.
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(2);
    expect(zone(game, one)).toBe("battlefield");
  });

  it("back on the battlefield it's a new object, with none of the old tokens (rule 400.7)", () => {
    const { game } = table();
    const it = enter(game, "Faerie Artisans");
    enter(game, "Grizzly Bears", B);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    toOwnersHand(game, it);
    game.debugMove(it, "battlefield");
    settle(game);
    enter(game, "Hill Giant", B);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
  });

  it("doesn't copy an opponent's token or your own creature", () => {
    const { game } = table();
    enter(game, "Faerie Artisans");
    enter(game, "Grizzly Bears", A);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
    game.debugApplyEffect(B, { kind: "create-token", token: "Saproling Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
  });
});

describe("Arcane Artisan", () => {
  /** An Artisan, three lands to pay for it, Bob's chosen card in hand. */
  const ready = (card: string) => {
    const t = table();
    const artisan = spawn(t.game, "Arcane Artisan");
    t.game.state.objects[artisan].summoningSick = false;
    lands(t.game, "Island", 3);
    const chosen = toHand(t.game, card, B);
    pickFromZone(t.b, chosen);
    return { ...t, artisan, chosen };
  };

  it("that player draws, exiles the card they choose, and creates the token under their control", () => {
    const { game, artisan, chosen } = ready("Grizzly Bears");
    const held = hand(game, B).length;
    activate(game, artisan, 0, { targets: [ref(B)] });
    expect(zone(game, chosen)).toBe("exile");
    expect(hand(game, B).length).toBe(held);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(1);
  });

  it("a noncreature card exiled this way makes nothing", () => {
    const { game, artisan, chosen } = ready("Divination");
    activate(game, artisan, 0, { targets: [ref(B)] });
    expect(zone(game, chosen)).toBe("exile");
    expect(tokensNamed(game, "Divination")).toBe(0);
  });

  it("exiles the tokens at the next end step after it leaves, not as it leaves", () => {
    const { game, artisan } = ready("Grizzly Bears");
    activate(game, artisan, 0, { targets: [ref(B)] });
    destroy(game, artisan);
    expect(graveyard(game)).toContain(artisan);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
  });

  it("a token from an activation that resolves after it left is exiled too (the ruling)", () => {
    const { game, artisan } = ready("Grizzly Bears");
    activate(game, artisan, 0, { targets: [ref(B)], settle: false });
    destroy(game, artisan);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
  });

  it("an extra token from Doubling Season goes too (the ruling)", () => {
    const { game, artisan } = ready("Grizzly Bears");
    spawn(game, "Doubling Season", B);
    activate(game, artisan, 0, { targets: [ref(B)] });
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(2);
    destroy(game, artisan);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
  });
});

describe("Mysterio, Master of Illusion", () => {
  const ILLUSION = "Illusion Villain Token";
  const VILLAIN = "Abomination, Terrifying Titan";

  it("makes one for each nontoken Villain you control, and exiles them all when it leaves", () => {
    const { game } = table();
    spawn(game, VILLAIN);
    const mysterio = enter(game, "Mysterio, Master of Illusion");
    const tokens = onBattlefield(game, ILLUSION);
    expect(tokens.length).toBe(2);
    expect(pt(game, tokens[0])).toEqual({ power: 3, toughness: 3 });
    expect(tokensNamed(game, ILLUSION)).toBe(2);
    toOwnersHand(game, mysterio);
    expect(tokensNamed(game, ILLUSION)).toBe(0);
  });

  it("gone before the tokens are made, nothing removes them (the ruling)", () => {
    const { game } = table();
    spawn(game, VILLAIN);
    const mysterio = enter(game, "Mysterio, Master of Illusion", A, { settle: false });
    toOwnersHand(game, mysterio);
    expect(zone(game, mysterio)).toBe("hand");
    // The other Villain still counts; nothing is watching Mysterio any more.
    expect(tokensNamed(game, ILLUSION)).toBe(1);
    game.debugMove(mysterio, "battlefield");
    toOwnersHand(game, mysterio);
    expect(tokensNamed(game, ILLUSION)).toBe(1);
  });
});
