/**
 * Web-slinging (rule 702.188a): "You may cast this spell by paying [cost]
 * and returning a tapped creature you control to its owner's hand rather
 * than paying its mana cost" — an alternative cost (601.2b, 601.2f–h), under
 * every normal timing rule (its ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, counters, enter, hand, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const slingOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "web-slinging");

describe("web-slinging", () => {
  it("is offered once per tapped creature you control — never an untapped one, nor someone else's", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const tappedBears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const tappedGiant = spawn(game, "Hill Giant", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    const spidey = toHand(game, "Spider-Man, Web-Slinger");
    const offers = slingOffers(game, spidey);
    expect(offers.map((o) => (o.kind === "cast-spell" ? o.webSlingingReturn?.object : undefined)).sort()).toEqual(
      [tappedBears, tappedGiant].sort(),
    );
  });

  it("isn't offered with no tapped creature, and the action is refused", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const spidey = toHand(game, "Spider-Man, Web-Slinger");
    expect(slingOffers(game, spidey)).toHaveLength(0);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spidey, targets: [], via: "web-slinging", webSlingingReturn: bears }),
    ).toMatch(/tapped creature/);
  });

  it("pays the web-slinging cost and returns the named creature to its owner's hand", () => {
    const { game } = table();
    const [plains] = lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const spidey = toHand(game, "Spider-Man, Web-Slinger");
    cast(game, spidey, { via: "web-slinging", webSlingingReturn: giant });
    expect(zone(game, spidey)).toBe("battlefield");
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
    expect(game.state.objects[spidey].castVia).toBe("web-slinging");
  });

  it("keeps normal timing: a creature spell isn't cast in combat or on another player's turn", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const spidey = toHand(game, "Spider-Man, Web-Slinger");
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(slingOffers(game, spidey)).toHaveLength(0);
    toStep(game, "postcombat-main");
    expect(slingOffers(game, spidey)).toHaveLength(1);
  });

  it("an instant is cast at instant speed, on another player's turn", () => {
    const { game } = table();
    const [island] = lands(game, "Island", 1);
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const sense = toHand(game, "Spider-Sense");
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    // Bob's turn: he bolts alice; she answers.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    game.state.objects[tapped].tapped = true;
    game.state.objects[island].tapped = false;
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: sense,
      targets: [ref(bolt)],
      via: "web-slinging",
      webSlingingReturn: tapped,
    });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, tapped)).toBe("hand");
    expect(game.state.players[A].life).toBe(20);
  });

  it("a creature tapped for mana as the spell is paid for can be the one returned (the ruling)", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const spiders = toHand(game, "Spiders-Man, Heroic Horde");
    lands(game, "Forest", 5);
    // The Elves aren't tapped yet: not offered.
    expect(slingOffers(game, spiders).some((o) => o.kind === "cast-spell" && o.webSlingingReturn?.object === elves)).toBe(false);
    // Tap them for {G} first — mana abilities are activated before costs are
    // paid (601.2g) — then return them.
    const manaIndex = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === elves && a.manaAbility === true);
    expect(manaIndex).toBeDefined();
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: elves,
      abilityIndex: manaIndex!.kind === "activate-ability" ? manaIndex!.abilityIndex : 0,
      targets: [],
    });
    expect(game.state.objects[elves].tapped).toBe(true);
    cast(game, spiders, { via: "web-slinging", webSlingingReturn: elves });
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
    // {4}{G}{G}: the floating {G} and five Forests.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Forest" && !game.state.objects[id].tapped)).toHaveLength(0);
    expect(zone(game, spiders)).toBe("battlefield");
  });

  it("is an alternative cost: never with another one (Fist of Suns), and a cost increase is paid on top", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Fist of Suns");
    spawn(game, "Thalia, Guardian of Thraben", B);
    const sense = toHand(game, "Spider-Sense");
    // Nothing to counter, so no offer at all; the cost question is asked of
    // the action itself.
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: sense,
        targets: [],
        via: "web-slinging",
        webSlingingReturn: bears,
        altCost: true,
      }),
    ).toMatch(/alternative cost/);
    // With a Soul Warden trigger on the stack: {U} plus Thalia's {1} — one
    // Island can't pay it; two can.
    spawn(game, "Soul Warden");
    enter(game, "Hill Giant", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    const trigger = game.state.zones.shared.stack.find((id) => game.state.objects[id].kind === "ability");
    expect(trigger).toBeDefined();
    expect(game.state.priority.holder).toBe(A);
    expect(slingOffers(game, sense)).toHaveLength(0);
    lands(game, "Island", 1);
    const offers = slingOffers(game, sense);
    expect(offers).toHaveLength(1);
    expect(offers.every((o) => o.kind === "cast-spell" && o.altCost !== true && o.free !== true)).toBe(true);
    cast(game, sense, { targets: [ref(trigger!)], via: "web-slinging", webSlingingReturn: bears });
    // Countered: the Warden's life never came.
    expect(game.state.players[A].life).toBe(20);
    expect(zone(game, bears)).toBe("hand");
  });

  it("returns one token of a stack, whose mana value is 0", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Citizen Token", count: 8 });
    const stack = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Citizen Token")!;
    expect(game.state.objects[stack].stackCount).toBe(8);
    game.state.objects[stack].tapped = true;
    const scarlet = toHand(game, "Scarlet Spider, Ben Reilly");
    expect(slingOffers(game, scarlet)).toHaveLength(1);
    cast(game, scarlet, { via: "web-slinging", webSlingingReturn: stack });
    const left = game.state.zones.shared.battlefield
      .map((id) => game.state.objects[id])
      .filter((o) => o.cardName === "Citizen Token")
      .reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(left).toBe(7);
    expect(zone(game, scarlet)).toBe("battlefield");
    expect(counters(game, scarlet)).toBe(0);
  });

  it("from the command zone, a commander's web-slinging cost carries the tax", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const spidey = game.debugSpawn("Spider-Man, Web-Slinger", A, "command");
    game.state.objects[spidey].isCommander = true;
    game.state.players[A].commanderCastCounts["Spider-Man, Web-Slinger"] = 1;
    // {W} plus {2} of tax: two Plains can't.
    expect(slingOffers(game, spidey)).toHaveLength(0);
    plains.push(...lands(game, "Plains", 1));
    expect(slingOffers(game, spidey)).toHaveLength(1);
    cast(game, spidey, { via: "web-slinging", webSlingingReturn: bears });
    expect(zone(game, spidey)).toBe("battlefield");
    expect(hand(game)).toContain(bears);
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
