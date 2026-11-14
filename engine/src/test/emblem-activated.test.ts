/**
 * An emblem with an activated ability of its own (rule 114.4: an emblem's
 * abilities function in the command zone) — `create-emblem`'s `activated`,
 * activated by the emblem's owner from the command zone as any permanent's is
 * (rule 602): Karn, Living Legacy's "Tap an untapped artifact you control:
 * This emblem deals 1 damage to any target" and Ob Nixilis of the Black
 * Oath's "{1}{B}, Sacrifice a creature: You gain X life and draw X cards".
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  destroy,
  enter,
  hand,
  lands,
  life,
  loyalty,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toLibrary,
  tokensNamed,
} from "./harness.js";

/** The emblem object `player` owns with an activated ability. */
const emblemObject = (game: Game, player: PlayerId = A): ObjectId | undefined =>
  game.state.emblems.find((e) => e.owner === player && e.object !== undefined)?.object;

const emblemOffers = (game: Game, player: PlayerId = A) =>
  game.legalActions(player).flatMap((a) => {
    const source = emblemObject(game, player);
    return a.kind === "activate-ability" && source !== undefined && a.source === source ? [a] : [];
  });

describe("Karn, Living Legacy", () => {
  it("+1 makes a tapped Powerstone", () => {
    const { game } = table();
    const karn = enter(game, "Karn, Living Legacy");
    loyalty(game, karn, 1);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    expect(game.state.objects[karn].counters.loyalty).toBe(5);
  });

  it("−1 pays any amount of mana and puts one of that many cards in hand; paying nothing looks at none", () => {
    const { game, a } = table();
    const karn = enter(game, "Karn, Living Legacy");
    lands(game, "Wastes", 3);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Lightning Bolt"), toLibrary(game, "Island")];
    const seen = pickFromZone(a, top[1]);
    loyalty(game, karn, -1, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    settle(game);
    expect(seen.offered).toHaveLength(3);
    expect(hand(game)).toContain(top[1]);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(3);

    // Nothing paid: nothing looked at (the ruling).
    const { game: g2 } = table();
    const karn2 = enter(g2, "Karn, Living Legacy");
    const before = hand(g2).length;
    loyalty(g2, karn2, -1, { settle: false });
    g2.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    g2.dispatch({ type: "choose-modes", player: A, modes: [], xValue: 0 });
    settle(g2);
    expect(hand(g2)).toHaveLength(before);
  });

  it("−7: its owner taps an untapped artifact for 1 damage — one just arrived too — from the command zone, after Karn is gone", () => {
    const { game } = table();
    const karn = enter(game, "Karn, Living Legacy");
    loyalty(game, karn, -7, { atLeast: 7 });
    const emblem = emblemObject(game);
    expect(emblem).toBeDefined();
    expect(game.state.objects[emblem!].zone).toBe("command");
    // No artifact: nothing to tap, so no offer.
    expect(emblemOffers(game)).toHaveLength(0);
    const sick = spawn(game, "Sol Ring", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", B);
    expect(emblemOffers(game)).toHaveLength(1);
    activate(game, emblem!, emblemOffers(game)[0].abilityIndex, { targets: [ref(bears)] });
    expect(game.state.objects[sick].tapped).toBe(true);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    // Tapped now: nothing left to pay with.
    expect(emblemOffers(game)).toHaveLength(0);
    // The emblem is no permanent's: Karn's leaving changes nothing (rule 114.4).
    if (game.state.objects[karn]?.zone === "battlefield") destroy(game, karn);
    spawn(game, "Mind Stone");
    activate(game, emblem!, emblemOffers(game)[0].abilityIndex, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    // Only its owner has it.
    expect(emblemOffers(game, B)).toHaveLength(0);
    expect(game.legalActions(B).some((a) => a.kind === "activate-ability" && a.source === emblem)).toBe(false);
  });
});

describe("Ob Nixilis of the Black Oath", () => {
  it("+2 drains each opponent; −2 makes a 5/5 flying Demon and costs 2 life", () => {
    const { game } = table({ players: 3 });
    const ob = enter(game, "Ob Nixilis of the Black Oath");
    loyalty(game, ob, 2);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(22);
    const { game: g2 } = table();
    const ob2 = enter(g2, "Ob Nixilis of the Black Oath");
    loyalty(g2, ob2, -2);
    expect(tokensNamed(g2, "5/5 Demon Token", A)).toBe(1);
    expect(life(g2, A)).toBe(18);
  });

  it("−8: {1}{B}, sacrifice a creature: gain and draw its power, from the command zone", () => {
    const { game } = table();
    const ob = enter(game, "Ob Nixilis of the Black Oath");
    loyalty(game, ob, -8, { atLeast: 8 });
    const emblem = emblemObject(game)!;
    expect(emblem).toBeDefined();
    // No mana, no offer.
    const giant = spawn(game, "Hill Giant");
    expect(emblemOffers(game)).toHaveLength(0);
    lands(game, "Swamp", 2);
    const before = hand(game).length;
    activate(game, emblem, emblemOffers(game)[0].abilityIndex, { sacrifice: giant });
    expect(game.state.objects[giant].zone).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(hand(game)).toHaveLength(before + 3);
  });
});
