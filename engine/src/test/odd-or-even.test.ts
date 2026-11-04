/**
 * "Choose odd or even", and the filter clauses that read a number's quality:
 * `manaValueParity` and `powerParity`, printed (Void Winnower, Kianne), chosen as
 * a spell resolves (Extinction Event, Zimone's Hypothesis) or as a permanent
 * enters (Ashling's Prerogative, Gollum). Zero is even, on every card that asks.
 */
import { describe, expect, it } from "vitest";
import { ODD_OR_EVEN } from "../filter.js";
import {
  A,
  B,
  blockOffer,
  C,
  cast,
  counters,
  D,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const ELVES = "Llanowar Elves"; // {G}, 1/1: odd
const BEARS = "Grizzly Bears"; // {1}{G}, 2/2: even
const DREADMAW = "Colossal Dreadmaw"; // {5}{G}, 6/6: even
const GIANT = "Hill Giant"; // {3}{R}, 3/3: even
const SOLDIER = "Soldier Token"; // no mana cost, 1/1: mana value 0
const HYDRA = "Mistcutter Hydra"; // {X}{G}, 0/0
const DIVINATION = "Divination"; // {2}{U}, a sorcery: odd

describe("Extinction Event: chosen as a spell resolves", () => {
  it("exiles each creature of the chosen quality, the controller's own too, and asks in words", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const elves = spawn(game, ELVES);
    const bears = spawn(game, BEARS);
    const theirs = spawn(game, DREADMAW, B);
    let asked: readonly string[] = [];
    let prompt: string | undefined;
    a.chooseCreatureTypeFn = (view, _source, options) => {
      asked = options;
      prompt = view.state.awaiting?.kind === "choose-creature-type" ? view.state.awaiting.prompt : undefined;
      return "even";
    };
    cast(game, toHand(game, "Extinction Event"));
    expect(asked).toEqual(ODD_OR_EVEN);
    expect(prompt).toBe("Choose odd or even");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
  });

  it("odd takes the odd ones", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const elves = spawn(game, ELVES);
    const bears = spawn(game, BEARS);
    const soldier = spawn(game, SOLDIER);
    a.chooseCreatureTypeFn = () => "odd";
    cast(game, toHand(game, "Extinction Event"));
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, soldier)).toBe("battlefield");
  });

  it("a token, of mana value 0, goes with even", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    spawn(game, SOLDIER);
    a.chooseCreatureTypeFn = () => "even";
    cast(game, toHand(game, "Extinction Event"));
    expect(named(game, SOLDIER)).toEqual([]);
  });

  it("reaches every player's creatures at four players", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const ids = [spawn(game, BEARS, B), spawn(game, GIANT, C), spawn(game, ELVES, D)];
    a.chooseCreatureTypeFn = () => "even";
    cast(game, toHand(game, "Extinction Event"));
    expect(ids.map((id) => zone(game, id))).toEqual(["exile", "exile", "battlefield"]);
  });
});

describe("Zimone's Hypothesis: power, read after the counter", () => {
  it("the counter comes first: it can take a creature out of the chosen quality", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, BEARS); // 2/2, then 3/3
    const dreadmaw = spawn(game, DREADMAW, B); // 6/6
    const elves = spawn(game, ELVES); // 1/1
    pickPermanents(a, bears);
    a.chooseCreatureTypeFn = () => "even";
    cast(game, toHand(game, "Zimone's Hypothesis"));
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears).power).toBe(3);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, dreadmaw)).toBe("hand");
    expect(hand(game, B)).toContain(dreadmaw);
  });

  it("the counter may be declined", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, BEARS);
    const elves = spawn(game, ELVES, B);
    pickPermanents(a);
    a.chooseCreatureTypeFn = () => "odd";
    cast(game, toHand(game, "Zimone's Hypothesis"));
    expect(counters(game, bears)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("hand");
  });
});

describe("Ashling's Prerogative: chosen as it enters", () => {
  function underPrerogative(quality: "odd" | "even") {
    const t = table();
    lands(t.game, "Mountain", 2);
    t.a.chooseCreatureTypeFn = () => quality;
    cast(t.game, toHand(t.game, "Ashling's Prerogative"));
    return t;
  }

  it("asks as it enters", () => {
    const { game } = underPrerogative("odd");
    const [prerogative] = named(game, "Ashling's Prerogative");
    expect(game.state.objects[prerogative].chosenOnEnter).toBe("odd");
  });

  it("gives each creature of the quality haste, whoever controls it, and not the others", () => {
    const { game } = underPrerogative("odd");
    const mine = spawn(game, ELVES);
    const theirs = spawn(game, ELVES, B);
    const bears = spawn(game, BEARS);
    expect(keywords(game, mine).has("haste")).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("has each creature without the quality enter tapped, and a noncreature enter as it would", () => {
    const { game } = underPrerogative("odd");
    const elves = enter(game, ELVES);
    const bears = enter(game, BEARS);
    const theirs = enter(game, BEARS, B);
    const land = enter(game, "Forest");
    expect(game.state.objects[elves].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(false);
  });

  it("zero is even: a token has haste under even, and enters tapped under odd", () => {
    const even = underPrerogative("even");
    even.game.debugApplyEffect(A, { kind: "create-token", token: SOLDIER, count: 1 });
    const [soldier] = named(even.game, SOLDIER);
    expect(keywords(even.game, soldier).has("haste")).toBe(true);
    expect(even.game.state.objects[soldier].tapped).toBe(false);

    const odd = underPrerogative("odd");
    odd.game.debugApplyEffect(A, { kind: "create-token", token: SOLDIER, count: 1 });
    const [theirs] = named(odd.game, SOLDIER);
    expect(keywords(odd.game, theirs).has("haste")).toBe(false);
    expect(odd.game.state.objects[theirs].tapped).toBe(true);
  });

  it("reads an X creature as it will be on the battlefield, X being 0 there (rules 614.12, 107.3)", () => {
    const { game } = underPrerogative("odd");
    lands(game, "Forest", 2);
    // X=1: mana value 2 on the stack, 1 once it has entered.
    cast(game, toHand(game, HYDRA), { x: 1 });
    const [hydra] = named(game, HYDRA);
    expect(game.state.objects[hydra].tapped).toBe(false);
  });

  it("stops applying as it leaves: the choice is the permanent's", () => {
    const { game } = underPrerogative("odd");
    const [prerogative] = named(game, "Ashling's Prerogative");
    const elves = spawn(game, ELVES);
    expect(keywords(game, elves).has("haste")).toBe(true);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "enchantment" } });
    settle(game);
    expect(zone(game, prerogative)).toBe("graveyard");
    expect(keywords(game, elves).has("haste")).toBe(false);
    const bears = enter(game, BEARS);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Gollum, Riddle Master: a trigger's filter reading the choice", () => {
  /** Gollum in play with `quality` chosen, at bob's main with lands to spare. */
  function withGollum(quality: "odd" | "even") {
    const t = table({ deck: "Swamp" });
    lands(t.game, "Swamp", 2);
    lands(t.game, "Mountain", 6, B);
    lands(t.game, "Forest", 6, B);
    t.a.chooseCreatureTypeFn = () => quality;
    cast(t.game, toHand(t.game, "Gollum, Riddle Master"));
    const [gollum] = named(t.game, "Gollum, Riddle Master");
    nextTurn(t.game);
    return { ...t, gollum };
  }

  it("triggers on an opponent's spell of the quality, and on no other", () => {
    const { game, a, gollum } = withGollum("even");
    cast(game, toHand(game, ELVES, B), { player: B });
    expect(counters(game, gollum)).toBe(0);
    pickModes(a, 0);
    cast(game, toHand(game, BEARS, B), { player: B });
    expect(counters(game, gollum)).toBe(1);
  });

  it("reads a spell's mana value as it's cast, X included", () => {
    const { game, a, gollum } = withGollum("even");
    pickModes(a, 0);
    // Blaze, {X}{R} with X=1: mana value 2.
    cast(game, toHand(game, "Blaze", B), { player: B, x: 1, targets: [ref(A)] });
    expect(counters(game, gollum)).toBe(1);
  });

  it("offers each mode once, then no longer triggers (rule 603.3c)", () => {
    const { game, a, gollum } = withGollum("odd");
    // The answer is an index into what's still offered: the first each time.
    pickModes(a, 0);
    cast(game, toHand(game, ELVES, B), { player: B });
    expect(counters(game, gollum)).toBe(1);

    const theirs = life(game, B);
    const mine = life(game, A);
    cast(game, toHand(game, ELVES, B), { player: B });
    expect(life(game, B)).toBe(theirs - 2);
    expect(life(game, A)).toBe(mine + 2);

    const cards = hand(game, A).length;
    cast(game, toHand(game, ELVES, B), { player: B });
    expect(hand(game, A).length).toBe(cards + 1);

    // All three chosen: no mode left, so nothing happens.
    cast(game, toHand(game, ELVES, B), { player: B });
    expect(counters(game, gollum)).toBe(1);
    expect(life(game, B)).toBe(theirs - 2);
    expect(hand(game, A).length).toBe(cards + 1);
    expect(game.state.zones.shared.stack.length).toBe(0);
  });

  it("its controller's own spell doesn't trigger it", () => {
    const { game, gollum } = withGollum("odd");
    nextTurn(game);
    lands(game, "Forest", 1);
    cast(game, toHand(game, ELVES));
    expect(counters(game, gollum)).toBe(0);
    expect(game.state.zones.shared.stack.length).toBe(0);
  });
});

describe("Void Winnower: printed parity", () => {
  it("its controller's opponents can't cast even spells, and zero is even", () => {
    const { game } = table();
    spawn(game, "Void Winnower");
    lands(game, "Forest", 4, B);
    nextTurn(game);
    expect(() => cast(game, toHand(game, BEARS, B), { player: B })).toThrow();
    expect(() => cast(game, toHand(game, "Ornithopter", B), { player: B })).toThrow();
    const elves = toHand(game, ELVES, B);
    cast(game, elves, { player: B });
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("its controller may cast them", () => {
    const { game } = table();
    spawn(game, "Void Winnower");
    lands(game, "Forest", 2);
    const bears = toHand(game, BEARS);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("opponents' even creatures can't block, a token among them; their odd ones can", () => {
    const { game, a } = table();
    const winnower = spawn(game, "Void Winnower");
    const even = spawn(game, BEARS, B);
    const token = spawn(game, SOLDIER, B);
    const odd = spawn(game, ELVES, B);
    const offer = blockOffer(game, a, [winnower]);
    const blockers = offer.eligible.map((e) => e.blocker);
    expect(blockers).toContain(odd);
    expect(blockers).not.toContain(even);
    expect(blockers).not.toContain(token);
  });

  it("its controller's own even creatures still block", () => {
    const { game, b } = table();
    spawn(game, "Void Winnower");
    const mine = spawn(game, BEARS);
    const theirs = spawn(game, ELVES, B);
    nextTurn(game);
    const offer = blockOffer(game, b, [theirs], A);
    expect(offer.eligible.map((e) => e.blocker)).toContain(mine);
  });
});

describe("Kianne, Corrupted Memory: a source condition on its own power", () => {
  it("even power flashes noncreatures, odd power flashes creatures, and a draw turns it over", () => {
    const { game } = table({ deck: "Island" });
    const kianne = spawn(game, "Kianne, Corrupted Memory");
    lands(game, "Island", 6);
    lands(game, "Forest", 2);
    toStep(game, "begin-combat");
    expect(pt(game, kianne).power).toBe(2);

    // Even: Divination at instant speed draws two, so two counters: even again.
    const bears = toHand(game, BEARS);
    expect(() => cast(game, bears, { settle: false })).toThrow();
    cast(game, toHand(game, DIVINATION));
    expect(counters(game, kianne)).toBe(2);
    expect(pt(game, kianne).power).toBe(4);

    // One more draw: odd, and the permission changes sides.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(pt(game, kianne).power).toBe(5);
    expect(() => cast(game, toHand(game, DIVINATION), { settle: false })).toThrow();
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
