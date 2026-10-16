/**
 * Plot (rule 702.170): "Any time you have priority during your main phase
 * while the stack is empty, you may exile this card from your hand and pay
 * [cost]. It becomes a plotted card." — a special action (116.2k). A plotted
 * card's owner may cast it from exile without paying its mana cost during
 * their main phase while the stack is empty, on any turn after the one it
 * became plotted (702.170d), whether or not it has plot; and effects can make
 * a card plotted (702.170c).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  cast,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const plotOffer = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).find((a) => a.kind === "plot" && a.card === card);

const plottedCasts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "plot");

const plot = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  const why = game.canDispatch({ type: "plot", player, card });
  if (why !== null) throw new Error(why);
  game.dispatch({ type: "plot", player, card });
};

describe("plot", () => {
  it("is a special action at sorcery speed: pay the plot cost, exile the card face up", () => {
    const { game } = table();
    const sharpshooter = toHand(game, "Longhorn Sharpshooter");
    lands(game, "Mountain", 4);
    expect(plotOffer(game, sharpshooter)).toMatchObject({ cost: "{3}{R}" });
    plot(game, sharpshooter);
    expect(zone(game, sharpshooter)).toBe("exile");
    expect(game.state.objects[sharpshooter].plottedOnTurn).toBe(game.state.turn.number);
    // Every land paid for it; the stack holds its own plotted trigger.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(4);
  });

  it("can't be done outside a main phase, with something on the stack, or without the mana", () => {
    const { game } = table({ step: "upkeep" });
    const alchemist = toHand(game, "Aloe Alchemist");
    lands(game, "Forest", 2);
    expect(plotOffer(game, alchemist)).toBeUndefined();
    expect(game.canDispatch({ type: "plot", player: A, card: alchemist })).toMatch(/main phase/);
    toStep(game, "precombat-main");
    expect(plotOffer(game, alchemist)).toBeDefined();
    // Not on the opponent's turn either, though B could cast an instant there.
    const bobs = toHand(game, "Aloe Alchemist", B);
    lands(game, "Forest", 2, B);
    expect(plotOffer(game, bobs, B)).toBeUndefined();
  });

  it("is cast free from exile on a later turn, as a sorcery, by its owner only", () => {
    const { game } = table();
    const alchemist = toHand(game, "Aloe Alchemist");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    // Its trigger targets the only creature, the bear.
    plot(game, alchemist);
    settle(game);
    // Not this turn.
    expect(plottedCasts(game, alchemist)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: alchemist, targets: [], via: "plot", free: true }))
      .toMatch(/plotted this turn/);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 4 });
    nextTurn(game); // Bob's turn: not his card, and not Alice's turn.
    expect(plottedCasts(game, alchemist, B)).toHaveLength(0);
    expect(plottedCasts(game, alchemist, A)).toHaveLength(0);
    nextTurn(game); // Alice's next turn, no mana open: free.
    for (const id of game.state.zones.shared.battlefield) game.state.objects[id].tapped = true;
    expect(plottedCasts(game, alchemist)).toHaveLength(1);
    cast(game, alchemist, { via: "plot", free: true });
    expect(zone(game, alchemist)).toBe("battlefield");
    expect(game.state.objects[alchemist].plottedOnTurn).toBeUndefined();
  });

  it("'when this card becomes plotted' triggers from exile, its controller choosing a target", () => {
    const { game, a } = table();
    const sharpshooter = toHand(game, "Longhorn Sharpshooter");
    lands(game, "Mountain", 4);
    pickTargets(a, B);
    plot(game, sharpshooter);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("an instant made plotted is still cast only as a sorcery (Make Your Own Luck)", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    const before = hand(game).length;
    const seen = pickFromZone(a, bolt);
    cast(game, toHand(game, "Make Your Own Luck"));
    // A land can't be chosen; the rest go to hand.
    expect(seen.offered).toEqual(expect.arrayContaining([bolt, bears]));
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].plottedOnTurn).toBe(game.state.turn.number);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    nextTurn(game);
    nextTurn(game, "upkeep");
    // Alice's upkeep: an instant, but plotted — sorcery timing.
    expect(plottedCasts(game, bolt)).toHaveLength(0);
    toStep(game, "precombat-main");
    expect(plottedCasts(game, bolt)).toHaveLength(1);
    cast(game, bolt, { via: "plot", free: true, targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(17);
  });

  it("choosing nothing plots nothing", () => {
    const { game, a } = table();
    toLibrary(game, "Lightning Bolt");
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    pickFromZone(a);
    cast(game, toHand(game, "Make Your Own Luck"));
    expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id].plottedOnTurn !== undefined)).toHaveLength(0);
  });

  it("Kellan Joins Up plots a nonland card of mana value 3 or less from hand", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Craw Wurm");
    const seen = pickFromZone(a, bears);
    enter(game, "Kellan Joins Up");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].plottedOnTurn).toBeDefined();
  });

  it("Lilah exiles a multicolored instant or sorcery cast from hand as it resolves, plotted", () => {
    const { game } = table();
    spawn(game, "Lilah, Undefeated Slickshot");
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    toLibrary(game, "Wastes");
    const luck = toHand(game, "Make Your Own Luck");
    cast(game, luck);
    expect(zone(game, luck)).toBe("exile");
    expect(game.state.objects[luck].plottedOnTurn).toBe(game.state.turn.number);
    // A monocolored one goes to the graveyard as usual.
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("leaving exile ends it: a plotted card that leaves and comes back isn't plotted", () => {
    const { game } = table();
    const alchemist = toHand(game, "Aloe Alchemist");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    plot(game, alchemist);
    settle(game);
    game.debugMove(alchemist, "graveyard");
    game.debugMove(alchemist, "exile");
    expect(game.state.objects[alchemist].plottedOnTurn).toBeUndefined();
  });
});
