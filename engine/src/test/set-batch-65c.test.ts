/**
 * Set walk batch 65 (c): the web-slinging cards (rule 702.188a) — the clause
 * of each most likely to be wrong, with web-slinging paid and not. The
 * mechanic itself is `web-slinging.test.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  type Table,
} from "./harness.js";

/** Cast `card` for its web-slinging cost, returning `returned`, and settle. */
const sling = (g: Table, card: ObjectId, returned: ObjectId, targets: ObjectId[] = []): void =>
  cast(g.game, card, { targets: targets.map(ref), via: "web-slinging", webSlingingReturn: returned });

describe("Scarlet Spider, Ben Reilly", () => {
  it("web-slung, enters with +1/+1 counters equal to the returned creature's mana value", () => {
    const g = table();
    lands(g.game, "Mountain", 1);
    lands(g.game, "Forest", 1);
    const giant = spawn(g.game, "Hill Giant", A, { tapped: true });
    const scarlet = toHand(g.game, "Scarlet Spider, Ben Reilly");
    sling(g, scarlet, giant);
    expect(zone(g.game, giant)).toBe("hand");
    expect(counters(g.game, scarlet)).toBe(4);
    expect(pt(g.game, scarlet)).toEqual({ power: 8, toughness: 7 });
    expect(keywords(g.game, scarlet).has("trample")).toBe(true);
  });

  it("reads the mana value as the creature last existed: a Phantasmal Image copying a Hill Giant counts 4, not 2", () => {
    const g = table();
    lands(g.game, "Island", 2);
    const giant = spawn(g.game, "Hill Giant", B);
    g.a.chooseCopyFn = () => giant;
    const image = toHand(g.game, "Phantasmal Image");
    cast(g.game, image);
    expect(g.game.state.objects[image].copyOf).toBe("Hill Giant");
    g.game.state.objects[image].tapped = true;
    lands(g.game, "Mountain", 1);
    lands(g.game, "Forest", 1);
    const scarlet = toHand(g.game, "Scarlet Spider, Ben Reilly");
    sling(g, scarlet, image);
    expect(zone(g.game, image)).toBe("hand");
    expect(counters(g.game, scarlet)).toBe(4);
  });

  it("cast for his mana cost, enters with none", () => {
    const g = table();
    lands(g.game, "Mountain", 2);
    lands(g.game, "Forest", 1);
    spawn(g.game, "Hill Giant", A, { tapped: true });
    const scarlet = toHand(g.game, "Scarlet Spider, Ben Reilly");
    cast(g.game, scarlet);
    expect(zone(g.game, scarlet)).toBe("battlefield");
    expect(counters(g.game, scarlet)).toBe(0);
  });

  it("put onto the battlefield some other way, enters with none", () => {
    const g = table();
    const scarlet = enter(g.game, "Scarlet Spider, Ben Reilly");
    expect(counters(g.game, scarlet)).toBe(0);
  });
});

describe("Spiders-Man, Heroic Horde", () => {
  it("web-slung: 3 life and two 2/1 reach Spiders", () => {
    const g = table();
    lands(g.game, "Forest", 6);
    const bears = spawn(g.game, "Grizzly Bears", A, { tapped: true });
    const horde = toHand(g.game, "Spiders-Man, Heroic Horde");
    sling(g, horde, bears);
    expect(life(g.game)).toBe(23);
    expect(tokensNamed(g.game, "2/1 Green Spider Token (Reach)", A)).toBe(2);
    const spider = g.game.battlefield.find((id) => g.game.state.objects[id].cardName === "2/1 Green Spider Token (Reach)")!;
    expect(pt(g.game, spider)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(g.game, spider).has("reach")).toBe(true);
  });

  it("gone before the trigger resolves, they were still cast using web-slinging (rule 603.4, as last known)", () => {
    const g = table();
    lands(g.game, "Forest", 6);
    const bears = spawn(g.game, "Grizzly Bears", A, { tapped: true });
    const horde = toHand(g.game, "Spiders-Man, Heroic Horde");
    cast(g.game, horde, { via: "web-slinging", webSlingingReturn: bears, settle: false });
    g.game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].kind === "ability") && s.priority.holder === A);
    g.game.debugMove(horde, "graveyard");
    settle(g.game);
    expect(zone(g.game, horde)).toBe("graveyard");
    expect(life(g.game)).toBe(23);
    expect(tokensNamed(g.game, "2/1 Green Spider Token (Reach)", A)).toBe(2);
  });

  it("cast for their mana cost: nothing", () => {
    const g = table();
    lands(g.game, "Forest", 2);
    spawn(g.game, "Grizzly Bears", A, { tapped: true });
    const horde = toHand(g.game, "Spiders-Man, Heroic Horde");
    cast(g.game, horde);
    expect(zone(g.game, horde)).toBe("battlefield");
    expect(life(g.game)).toBe(20);
    expect(tokensNamed(g.game, "2/1 Green Spider Token (Reach)", A)).toBe(0);
  });
});

describe("Silk, Web Weaver", () => {
  it("each creature spell you cast makes a 1/1 green and white Human Citizen; a noncreature spell doesn't", () => {
    const g = table();
    spawn(g.game, "Silk, Web Weaver");
    lands(g.game, "Forest", 2);
    lands(g.game, "Mountain", 1);
    cast(g.game, toHand(g.game, "Grizzly Bears"));
    expect(tokensNamed(g.game, "Human Citizen Token", A)).toBe(1);
    cast(g.game, toHand(g.game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(g.game, "Human Citizen Token", A)).toBe(1);
    const citizen = g.game.battlefield.find((id) => g.game.state.objects[id].cardName === "Human Citizen Token")!;
    expect(pt(g.game, citizen)).toEqual({ power: 1, toughness: 1 });
  });

  it("{3}{G}{W}: creatures you control get +2/+2 and vigilance until end of turn", () => {
    const g = table();
    const silk = spawn(g.game, "Silk, Web Weaver");
    const bears = spawn(g.game, "Grizzly Bears");
    const theirs = spawn(g.game, "Grizzly Bears", B);
    lands(g.game, "Forest", 4);
    lands(g.game, "Plains", 1);
    activate(g.game, silk);
    expect(pt(g.game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(g.game, silk).has("vigilance")).toBe(true);
    expect(pt(g.game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Spider-Man India", () => {
  it("a creature spell cast puts a +1/+1 counter on target creature you control, which gains flying", () => {
    const g = table();
    spawn(g.game, "Spider-Man India");
    const bears = spawn(g.game, "Grizzly Bears");
    lands(g.game, "Forest", 2);
    pickTargets(g.a, bears);
    cast(g.game, toHand(g.game, "Grizzly Bears"));
    expect(counters(g.game, bears)).toBe(1);
    expect(keywords(g.game, bears).has("flying")).toBe(true);
    toStep(g.game, "end");
    settle(g.game);
    g.game.advanceUntil((s) => s.turn.number === 2);
    expect(keywords(g.game, bears).has("flying")).toBe(false);
    expect(counters(g.game, bears)).toBe(1);
  });
});

describe("Spider-UK", () => {
  it("two creatures entered under your control this turn: draw a card and gain 2 life at your end step", () => {
    const g = table();
    spawn(g.game, "Spider-UK");
    enter(g.game, "Grizzly Bears");
    enter(g.game, "Grizzly Bears");
    const before = hand(g.game).length;
    toStep(g.game, "end");
    settle(g.game);
    expect(hand(g.game).length).toBe(before + 1);
    expect(life(g.game)).toBe(22);
  });

  it("one isn't enough, and an opponent's don't count", () => {
    const g = table();
    spawn(g.game, "Spider-UK");
    enter(g.game, "Grizzly Bears");
    enter(g.game, "Grizzly Bears", B);
    const before = hand(g.game).length;
    toStep(g.game, "end");
    settle(g.game);
    expect(hand(g.game).length).toBe(before);
    expect(life(g.game)).toBe(20);
  });
});

describe("Spider-Sense", () => {
  it("counters an instant or sorcery spell, or a triggered ability — not a creature spell or an activated ability", () => {
    const g = table();
    const { game } = g;
    lands(game, "Island", 2);
    const sense = toHand(game, "Spider-Sense");
    // A triggered ability: Soul Warden's, on the stack.
    spawn(game, "Soul Warden");
    enter(game, "Hill Giant", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    const trigger = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === sense && a.via === undefined);
    expect(offer?.kind === "cast-spell" && offer.targetOptions[0].some((t) => t.kind === "object" && t.object === trigger)).toBe(true);
    cast(game, sense, { targets: [ref(trigger)] });
    expect(life(game)).toBe(20);
  });

  it("can't target a creature spell", () => {
    const g = table();
    const { game } = g;
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const sense = toHand(game, "Spider-Sense");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(game.canDispatch({ type: "cast-spell", player: A, card: sense, targets: [ref(bears)] })).not.toBeNull();
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(game.canDispatch({ type: "cast-spell", player: A, card: sense, targets: [ref(bolt)] })).toBeNull();
  });
});

describe("Spider-Man, Brooklyn Visionary", () => {
  it("web-slung, enters and fetches a basic land onto the battlefield tapped", () => {
    const g = table();
    lands(g.game, "Forest", 3);
    const bears = spawn(g.game, "Grizzly Bears", A, { tapped: true });
    const forest = toLibrary(g.game, "Forest");
    pickFromZone(g.a, forest);
    const spidey = toHand(g.game, "Spider-Man, Brooklyn Visionary");
    sling(g, spidey, bears);
    expect(zone(g.game, spidey)).toBe("battlefield");
    expect(zone(g.game, forest)).toBe("battlefield");
    expect(g.game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Amazing Spider-Girl and Spider-Man, Web-Slinger", () => {
  it("web-slung for {2}{W} / {W}", () => {
    const g = table();
    lands(g.game, "Plains", 4);
    const bears = spawn(g.game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(g.game, "Hill Giant", A, { tapped: true });
    const girl = toHand(g.game, "Amazing Spider-Girl");
    const spidey = toHand(g.game, "Spider-Man, Web-Slinger");
    sling(g, girl, bears);
    sling(g, spidey, giant);
    expect(zone(g.game, girl)).toBe("battlefield");
    expect(zone(g.game, spidey)).toBe("battlefield");
    expect(keywords(g.game, girl).has("flying")).toBe(true);
    expect(keywords(g.game, girl).has("vigilance")).toBe(true);
  });
});
