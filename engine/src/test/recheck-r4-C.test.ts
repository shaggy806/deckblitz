/**
 * Need-keys recheck R4, group C: mana abilities with a rider applied as part of
 * the ability (Gemstone Mine, Sandstone Needle, Glittering Stockpile, Grove of
 * the Burnwillows), a mana ability reading its sacrificed creature (Soldevi
 * Adnate), "any opponent may sacrifice … if a player does" (Clackbridge Troll),
 * "you may sacrifice another creature. If you do" (Disciple of Freyalise) and
 * exploit (Sidisi, Undead Vizier).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, enter, hand, life, pickModes, pickPermanents, spawn, table, toStep, tokensNamed, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const pool = (game: Game): number => game.state.players[A].manaPool.length;
const untap = (game: Game, id: ObjectId): void => {
  game.state.objects[id].tapped = false;
};

describe("Gemstone Mine", () => {
  it("enters with three mining counters and is sacrificed as the last one is removed", () => {
    const { game } = table();
    const mine = enter(game, "Gemstone Mine");
    expect(counters(game, mine, "mining")).toBe(3);
    activate(game, mine);
    expect(counters(game, mine, "mining")).toBe(2);
    expect(zone(game, mine)).toBe("battlefield");
    untap(game, mine);
    activate(game, mine);
    expect(zone(game, mine)).toBe("battlefield");
    untap(game, mine);
    activate(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    expect(pool(game)).toBe(3);
  });
});

describe("Sandstone Needle", () => {
  it("enters tapped with two depletion counters; {R}{R} each, sacrificed after the second", () => {
    const { game } = table();
    const needle = enter(game, "Sandstone Needle");
    expect(game.state.objects[needle].tapped).toBe(true);
    expect(counters(game, needle, "depletion")).toBe(2);
    untap(game, needle);
    activate(game, needle);
    expect(zone(game, needle)).toBe("battlefield");
    untap(game, needle);
    activate(game, needle);
    expect(zone(game, needle)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R").length).toBe(4);
  });
});

describe("Glittering Stockpile", () => {
  it("puts a stash counter on as it taps for {R}, then sacrifices for that much mana", () => {
    const { game } = table();
    const pile = spawn(game, "Glittering Stockpile");
    activate(game, pile, 0);
    untap(game, pile);
    activate(game, pile, 0);
    expect(counters(game, pile, "stash")).toBe(2);
    expect(pool(game)).toBe(2);
    untap(game, pile);
    activate(game, pile, 1);
    expect(zone(game, pile)).toBe("graveyard");
    expect(pool(game)).toBe(4);
  });
});

describe("Grove of the Burnwillows", () => {
  it("each opponent gains 1 life when it taps for {R} or {G}, not for {C}", () => {
    const { game } = table();
    const grove = spawn(game, "Grove of the Burnwillows");
    activate(game, grove, 0);
    expect(life(game, B)).toBe(20);
    untap(game, grove);
    activate(game, grove, 1);
    expect(life(game, B)).toBe(21);
    expect(life(game, A)).toBe(20);
    expect(pool(game)).toBe(2);
  });
});

describe("Soldevi Adnate", () => {
  it("sacrifices a black creature for {B} equal to its mana value", () => {
    const { game } = table();
    const adnate = spawn(game, "Soldevi Adnate");
    const knight = spawn(game, "Vampire Nighthawk");
    game.dispatch({ type: "activate-ability", player: A, source: adnate, abilityIndex: 0, targets: [], sacrifice: knight });
    expect(zone(game, knight)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "B").length).toBe(3);
  });

  it("won't sacrifice a nonblack, nonartifact creature", () => {
    const { game } = table();
    const adnate = spawn(game, "Soldevi Adnate");
    const bears = spawn(game, "Grizzly Bears");
    const action = { type: "activate-ability", player: A, source: adnate, abilityIndex: 0, targets: [], sacrifice: bears } as const;
    expect(game.canDispatch(action)).not.toBeNull();
  });
});

describe("Clackbridge Troll", () => {
  it("gives the opponent three Goats; a sacrifice taps it, gains 3 life and draws once", () => {
    const { game, b } = table();
    const troll = enter(game, "Clackbridge Troll");
    expect(tokensNamed(game, "Goat Token", B)).toBe(3);
    const goat = Object.values(game.state.objects).find((o) => o.zone === "battlefield" && o.controller === B)!.id;
    const before = hand(game).length;
    pickModes(b, 0);
    pickPermanents(b, goat);
    toStep(game, "declare-attackers");
    expect(game.state.objects[troll].tapped).toBe(true);
    expect(life(game, A)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Disciple of Freyalise", () => {
  it("may sacrifice another creature to gain life and draw cards equal to its power", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    const before = hand(game).length;
    pickModes(a, 0);
    const disciple = enter(game, "Disciple of Freyalise");
    expect(zone(game, disciple)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game, A)).toBe(26);
    expect(hand(game).length).toBe(before + 6);
  });
});

describe("Sidisi, Undead Vizier", () => {
  it("exploiting itself still tutors", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const sidisi = enter(game, "Sidisi, Undead Vizier", A, { settle: false });
    a.chooseSacrificesFn = () => [sidisi];
    const before = hand(game).length;
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, sidisi)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});
