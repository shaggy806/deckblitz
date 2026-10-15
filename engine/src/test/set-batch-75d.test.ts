/**
 * Set walk batch 75, part d (2026-10-15): Secrets of Strixhaven Commander (SOC),
 * the first of the set. Written on the shared table in `harness.ts`.
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
  hand,
  keywords,
  lands,
  named,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const prepared = (game: Game, id: ObjectId): boolean => game.state.objects[id].prepared !== undefined;
const copyOf = (game: Game, id: ObjectId): ObjectId | undefined => game.state.objects[id].prepared?.copy;

describe("Dirgur Focusmage // Braingeyser", () => {
  it("makes instants and sorceries cost {1} less", () => {
    const { game } = table();
    spawn(game, "Dirgur Focusmage");
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, divination); // {2}{U} for {1}{U}
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("becomes prepared on an instant or sorcery of mana value 5 or more cast from hand, not a cheaper one", () => {
    const { game } = table();
    const mage = spawn(game, "Dirgur Focusmage");
    lands(game, "Island", 8);
    cast(game, toHand(game, "Divination"));
    expect(prepared(game, mage)).toBe(false);
    cast(game, toHand(game, "Brilliant Plan")); // mana value 5
    expect(prepared(game, mage)).toBe(true);
    const copy = copyOf(game, mage)!;
    expect(game.state.objects[copy].cardName).toBe("Braingeyser");
  });

  it("counts {X} in a spell's mana value on the stack; its Braingeyser copy, cast from exile, draws X and doesn't re-prepare it", () => {
    const { game } = table();
    const mage = spawn(game, "Dirgur Focusmage");
    lands(game, "Island", 10);
    // Braingeyser with X = 3 is mana value 5 on the stack (rule 202.3e).
    cast(game, toHand(game, "Braingeyser"), { x: 3, targets: [ref(A)] });
    expect(prepared(game, mage)).toBe(true);
    const before = hand(game).length;
    const theirs = hand(game, B).length;
    // The copy is cast from exile: mana value 5 again, but not from the hand,
    // so it doesn't prepare Dirgur again.
    cast(game, copyOf(game, mage)!, { via: "prepared", x: 3, targets: [ref(B)] });
    expect(prepared(game, mage)).toBe(false);
    expect(hand(game, B).length).toBe(theirs + 3);
    expect(hand(game).length).toBe(before);
  });
});

describe("Nev, the Practical Dean", () => {
  it("gives your creatures with counters on them, of any kind, trample", () => {
    const { game } = table();
    spawn(game, "Nev, the Practical Dean");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, bears).has("trample")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(other)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, other).has("trample")).toBe(true);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });

  it("puts X +1/+1 counters on Nev for your first {X} spell each turn only", () => {
    const { game } = table();
    const nev = spawn(game, "Nev, the Practical Dean");
    lands(game, "Island", 12);
    cast(game, toHand(game, "Braingeyser"), { x: 2, targets: [ref(A)] });
    expect(counters(game, nev)).toBe(2);
    expect(keywords(game, nev).has("trample")).toBe(true);
    cast(game, toHand(game, "Braingeyser"), { x: 3, targets: [ref(A)] });
    expect(counters(game, nev)).toBe(2);
  });

  it("doesn't trigger if your first {X} spell this turn came before Nev", () => {
    const { game } = table();
    lands(game, "Island", 12);
    cast(game, toHand(game, "Braingeyser"), { x: 1, targets: [ref(A)] });
    const nev = spawn(game, "Nev, the Practical Dean");
    cast(game, toHand(game, "Braingeyser"), { x: 2, targets: [ref(A)] });
    expect(counters(game, nev)).toBe(0);
  });
});

describe("Feral Appetite", () => {
  it("exiles a card from any graveyard, making a Pest only for a creature card", () => {
    const { game } = table();
    const appetite = spawn(game, "Feral Appetite");
    lands(game, "Forest", 4);
    const opt = toGraveyard(game, "Opt", B);
    activate(game, appetite, 0, { targets: [ref(opt)] });
    expect(zone(game, opt)).toBe("exile");
    expect(named(game, "Pest Token", A)).toHaveLength(0);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    activate(game, appetite, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "Pest Token", A)).toHaveLength(1);
  });

  it("gives attacking Pests you control +1/+0 and deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Feral Appetite");
    const pest = spawn(game, "Pest Token");
    const idle = spawn(game, "Pest Token");
    expect(pt(game, pest)).toEqual({ power: 1, toughness: 1 });
    a.declareAttackersFn = () => [{ attacker: pest, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, pest)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, pest).has("deathtouch")).toBe(true);
    expect(pt(game, idle)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, idle).has("deathtouch")).toBe(false);
  });
});
