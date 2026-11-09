import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const apply = (game: Game, player: PlayerId, effect: EffectSpec): void => {
  game.debugApplyEffect(player, effect, []);
  settle(game);
};
const emptyHand = (game: Game, player: PlayerId = A): void => {
  game.state.zones.perPlayer[player].hand.length = 0;
};
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("B294 group D", () => {
  it("The Council of Four: only a player's second draw on their own turn", () => {
    const { game } = table();
    spawn(game, "The Council of Four");
    const before = hand(game).length;
    // Bob's second card on Alice's turn: nothing.
    apply(game, B, { kind: "draw", amount: 2 });
    expect(hand(game).length).toBe(before);
    // Alice drew for the turn, so this is her second: she draws one more.
    apply(game, A, { kind: "draw", amount: 1 });
    expect(hand(game).length).toBe(before + 2);
  });

  it("The Council of Four: a second spell during its caster's turn makes a Knight", () => {
    const { game } = table();
    spawn(game, "The Council of Four");
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "2/2 White Knight Token", A)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "2/2 White Knight Token", A)).toBe(1);
  });

  it("The Council of Four: an opponent's second spell on your turn makes no Knight", () => {
    const { game, b } = table();
    spawn(game, "The Council of Four");
    lands(game, "Mountain", 2, B);
    const shockOne = toHand(game, "Shock", B);
    const shockTwo = toHand(game, "Shock", B);
    b.chooseTargetsFn = (_v, _s, _specs, legal) => legal.map((slot) => slot[0] ?? null);
    cast(game, toHand(game, "Ornithopter"), { settle: false });
    game.advanceUntil((s) => s.priority.holder === B && s.zones.shared.stack.length === 1);
    cast(game, shockOne, { player: B, targets: [ref(A)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B && s.zones.shared.stack.length === 1);
    cast(game, shockTwo, { player: B, targets: [ref(A)], settle: false });
    settle(game);
    expect(tokensNamed(game, "2/2 White Knight Token", A)).toBe(0);
  });

  it("Nashi: one exiled card only, paying life rather than mana", () => {
    const { game, a } = table();
    const stone = toLibrary(game, "Mind Stone", A);
    const bird = toLibrary(game, "Ornithopter", B);
    attack(game, a, [spawn(game, "Nashi, Moon Sage's Scion")], B);
    expect(zone(game, stone)).toBe("exile");
    expect(zone(game, bird)).toBe("exile");
    const before = life(game);
    cast(game, stone, { via: "impulse", altCost: true });
    expect(life(game)).toBe(before - 2);
    expect(zone(game, stone)).toBe("battlefield");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bird, targets: [], via: "impulse" } as Action)).not.toBeNull();
  });

  it("Risen Reef: land onto the battlefield tapped, or into hand", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest");
    pickFromZone(a, land);
    enter(game, "Risen Reef");
    expect(zone(game, land)).toBe("battlefield");
    expect(tapped(game, land)).toBe(true);

    const second = toLibrary(game, "Forest");
    pickFromZone(a);
    enter(game, "Risen Reef");
    expect(zone(game, second)).toBe("hand");

    const nonland = toLibrary(game, "Ornithopter");
    pickFromZone(a);
    enter(game, "Air Elemental");
    expect(zone(game, nonland)).toBe("hand");

    const third = toLibrary(game, "Ornithopter");
    enter(game, "Grizzly Bears");
    expect(zone(game, third)).toBe("library");
  });

  it("Glimpse the Impossible: what remains exiled goes to the graveyard, for Spawn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const cards = [toLibrary(game, "Wastes"), toLibrary(game, "Wastes"), toLibrary(game, "Wastes")];
    cast(game, toHand(game, "Glimpse the Impossible"));
    expect(cards.map((c) => zone(game, c))).toEqual(["exile", "exile", "exile"]);
    game.dispatch({ type: "play-land", player: A, card: cards[0] } as Action);
    expect(zone(game, cards[0])).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, cards[1])).toBe("graveyard");
    expect(zone(game, cards[2])).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(2);
  });

  it("Chthonian Nightmare: X must match, and the costs are all paid", () => {
    const { game } = table();
    const nightmare = enter(game, "Chthonian Nightmare");
    expect(game.state.players[A].energy).toBe(3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const fodder = spawn(game, "Ornithopter");
    expect(() => activate(game, nightmare, 0, { x: 1, targets: [ref(bears)], sacrifice: fodder })).toThrow(/target/i);
    activate(game, nightmare, 0, { x: 2, targets: [ref(bears)], sacrifice: fodder });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, nightmare)).toBe("hand");
    expect(zone(game, fodder)).toBe("graveyard");
    expect(game.state.players[A].energy).toBe(1);
  });

  it("Dionus: each Dionus's grant is its own ability; none the second time", () => {
    const { game } = table();
    spawn(game, "Mirror Gallery");
    spawn(game, "Dionus, Elvish Archdruid");
    spawn(game, "Dionus, Elvish Archdruid");
    const elf = spawn(game, "Llanowar Elves");
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(elf)]);
    settle(game);
    expect(counters(game, elf)).toBe(2);
    expect(tapped(game, elf)).toBe(false);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(elf)]);
    settle(game);
    expect(counters(game, elf)).toBe(2);
    expect(tapped(game, elf)).toBe(true);
  });

  it("Mnemonic Betrayal: cast opponents' cards with any type; the rest go back", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const land = toGraveyard(game, "Forest", B);
    const birds = toGraveyard(game, "Ornithopter", B);
    const spell = toHand(game, "Mnemonic Betrayal");
    cast(game, spell);
    expect(zone(game, spell)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Island", 2);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.canDispatch({ type: "play-land", player: A, card: land } as Action)).not.toBeNull();
    toStep(game, "end");
    settle(game);
    expect(zone(game, birds)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(birds);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Aclazotz: an opponent who can't discard draws you a card; a land makes a Bat", () => {
    const { game, a } = table({ players: 3 });
    const aclazotz = spawn(game, "Aclazotz, Deepest Betrayal");
    emptyHand(game, B);
    const before = hand(game).length;
    attack(game, a, [aclazotz], B);
    expect(hand(game).length).toBe(before + 1);
    // Carol discarded a Wastes, a land card.
    expect(tokensNamed(game, "Bat Token", A)).toBe(1);
  });

  it("Aclazotz // Temple of the Dead: dies into a tapped Temple; flips only with a small hand", () => {
    const { game } = table();
    const aclazotz = spawn(game, "Aclazotz, Deepest Betrayal");
    destroy(game, aclazotz);
    expect(zone(game, aclazotz)).toBe("battlefield");
    expect(types(game, aclazotz)).toEqual(["land"]);
    expect(tapped(game, aclazotz)).toBe(true);
    game.state.objects[aclazotz].tapped = false;
    lands(game, "Swamp", 3);
    expect(() => activate(game, aclazotz, 1)).toThrow();
    emptyHand(game, B);
    activate(game, aclazotz, 1);
    expect(types(game, aclazotz)).toContain("creature");
  });

  it("Lifestream's Blessing: X is fixed as cast; life only from exile", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const angel = spawn(game, "Serra Angel");
    const spell = toHand(game, "Lifestream's Blessing");
    const before = hand(game).length;
    cast(game, spell, { settle: false });
    // The Angel goes in response (and `destroy` settles the stack): X stays 4.
    destroy(game, angel);
    expect(zone(game, angel)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(life(game)).toBe(20);
  });

  it("Lifestream's Blessing: foretold, gains twice X", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    spawn(game, "Serra Angel");
    const spell = toHand(game, "Lifestream's Blessing");
    game.dispatch({ type: "foretell", player: A, card: spell });
    toStep(game, "precombat-main");
    const before = hand(game).length;
    cast(game, spell, { via: "foretell" });
    expect(hand(game).length).toBe(before + 4);
    expect(life(game)).toBe(28);
  });

  it("Phyrexian Vindicator: prevented, and reflected at any other target", () => {
    const { game, a } = table();
    const vindicator = spawn(game, "Phyrexian Vindicator");
    const seen = watchTargets(a, () => [B]);
    game.debugApplyEffect(B, { kind: "damage", amount: 6, target: 0 }, [ref(vindicator)]);
    settle(game);
    expect(zone(game, vindicator)).toBe("battlefield");
    expect(life(game, B)).toBe(14);
    expect(seen.offered[0]).not.toContain(vindicator);
  });

  it("Tenuous Truce: end-step draws; sacrificed by an attack either way, not by others", () => {
    const { game, a, b } = table({ players: 3 });
    lands(game, "Plains", 2);
    const truce = toHand(game, "Tenuous Truce");
    cast(game, truce, { targets: [ref(B)] });
    const handA = hand(game).length;
    const handB = hand(game, B).length;
    toStep(game, "end", B);
    settle(game);
    expect(hand(game).length).toBe(handA + 1);
    expect(hand(game, B).length).toBeGreaterThanOrEqual(handB + 1);

    // Carol's attack isn't Alice's or Bob's; Alice attacking Carol leaves it too.
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [bear], C);
    expect(zone(game, truce)).toBe("battlefield");
    // Bob attacks Alice.
    const bobs = spawn(game, "Grizzly Bears", B);
    attack(game, b, [bobs], A);
    expect(zone(game, truce)).toBe("graveyard");
  });

  it("Tenuous Truce: attacking the enchanted opponent's planeswalker counts", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const truce = toHand(game, "Tenuous Truce");
    cast(game, truce, { targets: [ref(B)] });
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 3;
    attack(game, a, [spawn(game, "Grizzly Bears")], walker);
    expect(zone(game, truce)).toBe("graveyard");
  });

  function birdsBlessed(game: Game): ObjectId {
    lands(game, "Plains", 4);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Songbirds' Blessing"), { targets: [ref(bear)] });
    return bear;
  }

  it("Songbirds' Blessing: the Aura enters, the rest go to the bottom", () => {
    const { game, a } = table();
    const bear = birdsBlessed(game);
    const aura = toLibrary(game, "Pacifism");
    const skipped = toLibrary(game, "Wastes");
    pickModes(a, 0);
    attack(game, a, [bear], B);
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(skipped);
  });

  it("Songbirds' Blessing: declined, it goes to hand", () => {
    const { game, a } = table();
    const bear = birdsBlessed(game);
    const aura = toLibrary(game, "Pacifism");
    pickModes(a);
    attack(game, a, [bear], B);
    expect(zone(game, aura)).toBe("hand");
  });

  it("Songbirds' Blessing: with nothing to enchant, it goes to hand (the ruling)", () => {
    const { game, a } = table();
    const bear = birdsBlessed(game);
    const aura = toLibrary(game, "Ensoul Artifact");
    pickModes(a, 0);
    attack(game, a, [bear], B);
    expect(zone(game, aura)).toBe("hand");
  });

  it("Out of the Tombs: an empty library's draw returns a creature, or loses", () => {
    const { game } = table();
    spawn(game, "Out of the Tombs");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.state.zones.perPlayer[A].library.length = 0;
    apply(game, A, { kind: "draw", amount: 1 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.players[A].hasLost).toBeFalsy();
    apply(game, A, { kind: "draw", amount: 1 });
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Out of the Tombs: two eon counters, then mills that many", () => {
    const { game } = table();
    const tombs = spawn(game, "Out of the Tombs");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, tombs, "eon")).toBe(2);
    expect(graveyard(game)).toHaveLength(2);
  });

  it("Tempting Contract: for each opponent who does, as one creation", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Tempting Contract");
    // Xorn's "plus an additional" counts once, on your one creation.
    spawn(game, "Xorn");
    pickModes(b, 0);
    pickModes(c, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("Tempting Contract: only those who accept", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Tempting Contract");
    pickModes(b);
    pickModes(c, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("Lulu: a creature attacking you, not one attacking your planeswalker", () => {
    const { game, a, b } = table();
    spawn(game, "Lulu, Stern Guardian");
    const walker = spawn(game, "Jace Beleren");
    game.state.objects[walker].counters.loyalty = 3;
    const toPlayer = spawn(game, "Grizzly Bears", B);
    const alsoToPlayer = spawn(game, "Grizzly Bears", B);
    const toWalker = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const seen = watchTargets(a, (offered) => [offered[0][0]]);
    b.declareAttackersFn = () => [
      { attacker: toPlayer, defender: A },
      { attacker: alsoToPlayer, defender: A },
      { attacker: toWalker, defender: walker },
    ];
    toStep(game, "postcombat-main", B);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(toPlayer);
    expect(seen.offered[0]).toContain(alsoToPlayer);
    expect(seen.offered[0]).not.toContain(toWalker);
    expect(counters(game, toPlayer, "stun") + counters(game, alsoToPlayer, "stun")).toBe(1);
  });

  it("All-Out Assault: the next attack untaps, once", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    enter(game, "All-Out Assault");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(tapped(game, bear)).toBe(false);
    // The additional combat: it attacks again and stays tapped.
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.step === "precombat-main");
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(tapped(game, bear)).toBe(true);
  });

  it("The Sound of Drums: double combat damage only", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "The Sound of Drums"), { targets: [ref(bear)] });
    attack(game, a, [bear], B);
    expect(life(game, B)).toBe(16);
  });

  it("Sorcerer Class: creature mana pays a level; the spell deals the damage", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const klass = enter(game, "Sorcerer Class");
    activate(game, klass, 0);
    expect(game.state.objects[klass].classLevel).toBe(2);
    spawn(game, "Grizzly Bears");
    activate(game, klass, 1);
    expect(game.state.objects[klass].classLevel).toBe(3);
    lands(game, "Mountain", 2);
    const shock = toHand(game, "Shock");
    const before = life(game, B);
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 2 - 1);
    const hit = (game.state.eventLog ?? []).filter((e) => (e as { type?: string }).type?.startsWith("damage") === true && (e as unknown as { source?: ObjectId }).source === shock);
    expect(hit.length).toBeGreaterThan(0);
  });

  it("Desecrate Reality: even mana values; adamant returns an odd card", () => {
    const { game } = table();
    lands(game, "Wastes", 7);
    const bird = toGraveyard(game, "Llanowar Elves");
    const opposite = spawn(game, "Grizzly Bears", B);
    const odd = spawn(game, "Llanowar Elves", B);
    expect(() => cast(game, toHand(game, "Desecrate Reality"), { targets: [ref(odd), null, null] })).toThrow(/target/i);
    cast(game, toHand(game, "Desecrate Reality"), { targets: [ref(opposite), null, null] });
    expect(zone(game, opposite)).toBe("exile");
    expect(zone(game, bird)).toBe("battlefield");
  });

  it("Desecrate Reality: without three colorless, no return", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const bird = toGraveyard(game, "Llanowar Elves");
    cast(game, toHand(game, "Desecrate Reality"), { targets: [null, null, null] });
    expect(zone(game, bird)).toBe("graveyard");
  });

  it("Minsc & Boo: Boo on entry; the −2's Hamster draws X", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const minsc = enter(game, "Minsc & Boo, Timeless Heroes");
    const boo = named(game, "Boo", A)[0];
    loyalty(game, minsc, 1, { targets: [ref(boo)] });
    expect(counters(game, boo)).toBe(3);
    pickModes(a);
    toStep(game, "precombat-main");
    const before = hand(game).length;
    pickTargets(a, B);
    loyalty(game, minsc, -2, { atLeast: 3 });
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before + 4);
  });

  it("Minsc & Boo: a non-Hamster draws nothing", () => {
    const { game, a } = table();
    pickModes(a);
    const minsc = enter(game, "Minsc & Boo, Timeless Heroes");
    expect(named(game, "Boo", A)).toHaveLength(0);
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickTargets(a, B);
    loyalty(game, minsc, -2, { atLeast: 3 });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
  });

  it("Tinybones Joins Up: any number of players each discard; each mill and lose 1", () => {
    const { game, a } = table({ players: 3 });
    const bob = hand(game, B).length;
    const carol = hand(game, C).length;
    const alice = hand(game).length;
    pickTargets(a, B, C);
    enter(game, "Tinybones Joins Up");
    expect(hand(game, B).length).toBe(bob - 1);
    expect(hand(game, C).length).toBe(carol - 1);
    expect(hand(game).length).toBe(alice);
    pickTargets(a, B);
    enter(game, "Thalia, Guardian of Thraben");
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(20);
    expect(graveyard(game, B).length).toBeGreaterThanOrEqual(2);
  });

  it("Chandra: copies once a turn; +1 lets one instant or sorcery be cast", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Hope's Beacon");
    game.state.objects[chandra].counters.loyalty = 5;
    lands(game, "Mountain", 3);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);

    const shockOne = toLibrary(game, "Shock");
    const shockTwo = toLibrary(game, "Shock");
    const land = toLibrary(game, "Mountain");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    loyalty(game, chandra, 1);
    expect(zone(game, shockOne)).toBe("exile");
    expect(game.canDispatch({ type: "play-land", player: A, card: land } as Action)).not.toBeNull();
    cast(game, shockOne, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(12);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shockTwo, targets: [ref(B)], via: "impulse" } as Action)).not.toBeNull();
  });

  it("Chandra: −X deals X to each of up to two targets", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Hope's Beacon");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { x: 3, atLeast: 5, targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, chandra, "loyalty")).toBe(2);
  });

  it("Shadow of the Goblin: a land from the graveyard pings; from hand doesn't", () => {
    const { game } = table();
    spawn(game, "Shadow of the Goblin");
    spawn(game, "Ramunap Excavator");
    const fromYard = toGraveyard(game, "Wastes");
    game.dispatch({ type: "play-land", player: A, card: fromYard } as Action);
    settle(game);
    expect(zone(game, fromYard)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    const fromHand = toHand(game, "Wastes");
    game.dispatch({ type: "play-land", player: A, card: fromHand } as Action);
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("Shadow of the Goblin: discards then draws at the first main phase", () => {
    const { game } = table();
    spawn(game, "Shadow of the Goblin");
    const before = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    // The draw step's card, then a discard and a draw.
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game)).toHaveLength(1);
  });

  it("Kitesail Larcenist: a Treasure and nothing else while it stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const kitesail = enter(game, "Kitesail Larcenist");
    expect(types(game, bears)).toEqual(["artifact"]);
    expect(subtypes(game, bears)).toEqual(["Treasure"]);
    expect(keywords(game, bears).size).toBe(0);
    destroy(game, kitesail);
    expect(types(game, bears)).toEqual(["creature"]);
  });

  it("Kitesail Larcenist: gone before it resolves, nothing happens", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const kitesail = enter(game, "Kitesail Larcenist", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(kitesail, "graveyard");
    settle(game);
    expect(types(game, bears)).toEqual(["creature"]);
  });

  it("Phial: one Phial, hand empty, draw of one is two; draw of two is three", () => {
    const { game } = table();
    spawn(game, "Phial of Galadriel");
    emptyHand(game);
    apply(game, A, { kind: "draw", amount: 1 });
    expect(hand(game)).toHaveLength(2);
    emptyHand(game);
    apply(game, A, { kind: "draw", amount: 2 });
    expect(hand(game)).toHaveLength(3);
    apply(game, A, { kind: "draw", amount: 1 });
    expect(hand(game)).toHaveLength(4);
  });

  it("Phial: two Phials, a draw of one is three (the ruling), not four", () => {
    const { game } = table();
    spawn(game, "Mirror Gallery");
    spawn(game, "Phial of Galadriel");
    spawn(game, "Phial of Galadriel");
    emptyHand(game);
    apply(game, A, { kind: "draw", amount: 1 });
    expect(hand(game)).toHaveLength(3);
  });

  it("Phial: doubles life gained at 5 or less, a life total set higher too", () => {
    const { game } = table();
    spawn(game, "Phial of Galadriel");
    game.state.players[A].life = 3;
    apply(game, A, { kind: "gain-life", amount: 2 });
    expect(life(game)).toBe(7);
    apply(game, A, { kind: "gain-life", amount: 2 });
    expect(life(game)).toBe(9);
    game.state.players[A].life = 3;
    apply(game, A, { kind: "set-life-total", who: "you", amount: 10 });
    expect(life(game)).toBe(17);
  });

  it("Birthing Ritual: sacrifice, then a creature up to its mana value plus one", () => {
    const { game, a } = table();
    spawn(game, "Birthing Ritual");
    const fodder = spawn(game, "Llanowar Elves");
    const two = toLibrary(game, "Grizzly Bears");
    const big = toLibrary(game, "Serra Angel");
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    pickModes(a, 0);
    const look = { offered: [] as readonly ObjectId[], looked: 0 };
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      if (max === 0) {
        look.looked += 1;
        return [];
      }
      look.offered = eligible;
      return [two];
    };
    a.chooseSacrificesFn = () => [fodder];
    toStep(game, "end");
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, two)).toBe("battlefield");
    expect(look.offered).toContain(two);
    expect(look.offered).not.toContain(big);
    // Seen before the sacrifice is decided.
    expect(look.looked).toBe(1);
  });

  it("Birthing Ritual: not sacrificing still bottoms the seven", () => {
    const { game, a } = table();
    spawn(game, "Birthing Ritual");
    spawn(game, "Llanowar Elves");
    const seven = Array.from({ length: 7 }, () => toLibrary(game, "Ornithopter"));
    pickModes(a);
    toStep(game, "end");
    settle(game);
    const lib = game.state.zones.perPlayer[A].library;
    // The top seven went underneath (index 0 is the top).
    for (const card of seven) expect(lib.indexOf(card)).toBeGreaterThanOrEqual(lib.length - 7);
  });

  it("Jeska: tripled to an opponent, not to a permanent; gone on your next turn", () => {
    const { game, a, b } = table();
    const jeska = spawn(game, "Jeska, Thrice Reborn");
    const bear = spawn(game, "Grizzly Bears");
    loyalty(game, jeska, 0, { atLeast: 3, targets: [ref(bear)] });
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 5;
    attack(game, a, [bear], walker);
    expect(game.state.objects[walker].counters.loyalty).toBe(3);
    toStep(game, "precombat-main", A);
    b.declareBlockersFn = () => [];
    attack(game, a, [bear], B);
    expect(life(game, B)).toBe(18);
  });

  it("Jeska: triples this turn's combat damage to that opponent", () => {
    const { game, a } = table();
    const jeska = spawn(game, "Jeska, Thrice Reborn");
    const bear = spawn(game, "Grizzly Bears");
    loyalty(game, jeska, 0, { atLeast: 3, targets: [ref(bear)] });
    attack(game, a, [bear], B);
    expect(life(game, B)).toBe(14);
  });

  it("Jolene: once per attack on opponents, for the attacking player", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Jolene, the Plunder Queen");
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobs2 = spawn(game, "Grizzly Bears", B);
    attack(game, a, [mine], B);
    // Alice's Treasure, plus Jolene's own additional one.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: bobs, defender: C },
      { attacker: bobs2, defender: A },
    ];
    toStep(game, "postcombat-main", B);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
  });

  it("Jolene: attacking only Jolene's controller makes nothing", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Jolene, the Plunder Queen");
    const bobs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bobs], A);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });

  it("Surge to Victory: +X/+0 by the exiled card, a free copy per hit", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const shock = toGraveyard(game, "Shock");
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Surge to Victory"), { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("exile");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    a.chooseCastNowFn = (_v, offer) => ({
      type: "cast-spell",
      player: A,
      card: (offer.casts[0] as unknown as { card: ObjectId }).card,
      targets: [ref(B)],
      via: "effect",
      free: true,
    });
    attack(game, a, [bear], B);
    expect(life(game, B)).toBe(20 - 3 - 2);
    expect(zone(game, shock)).toBe("exile");
  });

  it("Sorin: −6 returns creatures and planeswalkers destroyed; not himself", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Lord of Innistrad");
    const bears = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 3;
    expect(() => loyalty(game, sorin, -6, { atLeast: 7, targets: [ref(sorin)], settle: false })).toThrow(/target/i);
    loyalty(game, sorin, -6, { atLeast: 7, targets: [ref(bears), ref(walker)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(game.state.objects[walker].controller).toBe(A);
  });

  it("Sorin: +1 makes a 1/1 lifelinker", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Lord of Innistrad");
    game.state.objects[sorin].counters.loyalty = 3;
    loyalty(game, sorin, 1);
    expect(tokensNamed(game, "1/1 Lifelink Vampire Token", A)).toBe(1);
    const token = named(game, "1/1 Lifelink Vampire Token", A)[0];
    expect(keywords(game, token).has("lifelink")).toBe(true);
  });

  it("Noctis: artifacts from the graveyard for 3 life more, with a finality counter", () => {
    const { game } = table();
    spawn(game, "Noctis, Prince of Lucis");
    lands(game, "Wastes", 2);
    const stone = toGraveyard(game, "Mind Stone");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "graveyard-permission" } as Action)).not.toBeNull();
    cast(game, stone, { via: "graveyard-permission" });
    expect(zone(game, stone)).toBe("battlefield");
    expect(life(game)).toBe(17);
    expect(counters(game, stone, "finality")).toBe(1);
  });

  it("Toph: power from +1/+1 counters on lands", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest");
    pickTargets(a, land);
    const toph = enter(game, "Toph, the Blind Bandit");
    expect(counters(game, land)).toBe(2);
    expect(pt(game, toph)).toEqual({ power: 2, toughness: 3 });
  });

  it("Izzet Generatorium: one more energy; draws once four are spent", () => {
    const { game } = table();
    const gen = spawn(game, "Izzet Generatorium");
    apply(game, A, { kind: "get-energy", amount: 2 });
    expect(game.state.players[A].energy).toBe(3);
    expect(() => activate(game, gen)).toThrow();
    game.state.players[A].energy = 6;
    apply(game, A, { kind: "pay-energy", amount: 4 });
    const before = hand(game).length;
    activate(game, gen);
    expect(hand(game).length).toBe(before + 1);
  });
});
