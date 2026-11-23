import { describe, expect, it } from "vitest";
import { invalidateComputedCache } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("playtest batch 341 G", () => {
  it("Hound of Urabrask comes back once with an oil counter, a 4/4 double striker", () => {
    const { game } = table();
    const hound = spawn(game, "Hound of Urabrask");
    destroy(game, hound);
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Hound of Urabrask");
    expect(back).toBeDefined();
    expect(counters(game, back!, "oil")).toBe(1);
    expect(pt(game, back!)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, back!).has("double-strike")).toBe(true);
    destroy(game, back!);
    expect(zone(game, back!)).not.toBe("battlefield");
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Hound of Urabrask")).toBe(true);
  });

  it("The Knight of Weeks gets +7/+7 only for each full seven day counters", () => {
    const { game } = table();
    const knight = spawn(game, "The Knight of Weeks");
    game.state.objects[knight].counters.day = 6;
    invalidateComputedCache();
    expect(pt(game, knight)).toEqual({ power: 1, toughness: 1 });
    // Another Knight entering under alice's control adds the seventh.
    enter(game, "The Knight of Weeks", B);
    expect(counters(game, knight, "day")).toBe(6);
    enter(game, "Zhalfirin Lancer");
    expect(counters(game, knight, "day")).toBe(7);
    expect(pt(game, knight)).toEqual({ power: 8, toughness: 8 });
    game.state.objects[knight].counters.day = 13;
    invalidateComputedCache();
    expect(pt(game, knight)).toEqual({ power: 8, toughness: 8 });
  });

  it("Pulse of the Hunter Maze returns only when you have more poison counters than that opponent", () => {
    const { game } = table();
    for (let i = 0; i < 6; i++) spawn(game, "Forest");
    const pulse = toHand(game, "Pulse of the Hunter Maze");
    cast(game, pulse, { targets: [ref(B)] });
    expect(game.state.players[B].counters?.poison ?? 0).toBe(1);
    expect(zone(game, pulse)).not.toBe("hand");
    expect(graveyard(game)).toContain(pulse);

    const again = toHand(game, "Pulse of the Hunter Maze");
    game.state.players[A].counters = { ...(game.state.players[A].counters ?? {}), poison: 3 };
    cast(game, again, { targets: [ref(B)] });
    expect(game.state.players[B].counters?.poison ?? 0).toBe(2);
    expect(hand(game)).toContain(again);
  });

  it("Platinum Persecutor stops a decking loss, then wins once every library is empty", () => {
    const { game } = table();
    spawn(game, "Platinum Persecutor");
    toStep(game, "upkeep");
    // Libraries still hold cards: no win.
    expect(game.state.result.over).toBe(false);
    game.state.zones.perPlayer[A].library.length = 0;
    game.state.zones.perPlayer[B].library.length = 0;
    invalidateComputedCache();
    // Bob draws from an empty library on his turn and doesn't lose.
    toStep(game, "precombat-main", B);
    expect(game.state.result.over).toBe(false);
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.result.over || s.turn.number > turn + 1);
    expect(game.state.result.winner).toBe(A);
    expect(game.state.turn.step).toBe("upkeep");
  });

  it("Sword of Fire and Ice and War and Peace: 2 to any target, a card, then defending player's hand and your hand", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Sword of Fire and Ice and War and Peace");
    for (let i = 0; i < 4; i++) spawn(game, "Wastes");
    activate(game, sword, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
    pickTargets(a, B);
    const handBefore = hand(game).length;
    const bobHand = hand(game, B).length;
    attack(game, a, [bear]);
    // 6 combat, 2 from the targeted damage, then one per card in bob's hand.
    expect(life(game, B)).toBe(20 - 6 - 2 - bobHand);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(life(game, A)).toBe(20 + handBefore + 1);
  });

  it("Devoted Jeskai can target only a creature with mana value up to your devotion to Jeskai", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    // Devotion 1 (its own {U}): the Bears, mana value 2, can't be targeted.
    enter(game, "Devoted Jeskai");
    expect(zone(game, bears)).toBe("battlefield");
    // Delver's {U} and the first Jeskai's make devotion 3 for the second.
    spawn(game, "Delver of Secrets");
    enter(game, "Devoted Jeskai");
    expect(zone(game, bears)).toBe("hand");
  });

  it("Corrupted Key grants menace and deathtouch only while tapped", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const key = spawn(game, "Corrupted Key");
    expect(keywords(game, bear).has("deathtouch")).toBe(false);
    game.state.objects[key].tapped = true;
    invalidateComputedCache();
    expect(keywords(game, bear).has("menace")).toBe(true);
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
  });

  it("Tragda grows when any player's land card goes to a graveyard", () => {
    const { game } = table();
    const tragda = spawn(game, "Tragda, the Burner");
    const land = spawn(game, "Forest", B);
    destroy(game, land, A);
    expect(counters(game, tragda)).toBe(2);
  });

  it("Bag of Stroopwafels enters with eight counters and eats one a use", () => {
    const { game } = table();
    const bag = enter(game, "Bag of Stroopwafels");
    expect(counters(game, bag, "stroopwafel")).toBe(8);
    for (let i = 0; i < 3; i++) spawn(game, "Wastes");
    const before = hand(game).length;
    activate(game, bag, 0);
    expect(counters(game, bag, "stroopwafel")).toBe(7);
    expect(life(game)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
  });

  it("How to Keep an Izzet Mage Busy goes back to its owner's hand", () => {
    const { game } = table();
    spawn(game, "Island");
    const busy = toHand(game, "How to Keep an Izzet Mage Busy");
    cast(game, busy);
    expect(hand(game)).toContain(busy);
  });

  it("Ate-o'-Clock investigates and regenerates its target", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i++) spawn(game, "Forest");
    cast(game, toHand(game, "Ate-o'-Clock"), { targets: [ref(bear)] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Aggressive Crag taps itself at the beginning of your combat", () => {
    const { game } = table();
    const crag = spawn(game, "Aggressive Crag");
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[crag].tapped).toBe(true);
  });
});
