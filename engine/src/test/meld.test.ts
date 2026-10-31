/**
 * Meld (rules 701.42, 712.4): one card of a meld pair exiles itself and its
 * counterpart, both owned and controlled by its controller, and puts them
 * onto the battlefield combined — one new object with the combined back
 * face's characteristics and its front faces' mana value summed (712.8g),
 * which leaves the battlefield as two cards (712.21). Graf Rats and Midnight
 * Scavengers into Chittering Host (a triggered meld), Hanweir Battlements
 * and Hanweir Garrison into Hanweir, the Writhing Township (an activated
 * one).
 */
import { describe, expect, it } from "vitest";

import { isCardFront } from "../cards/classify.js";
import { manaValueOfObject } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  pickPermanents,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const HOST = "Chittering Host";
const TOWNSHIP = "Hanweir, the Writhing Township";

/** The permanents on the battlefield showing `name` as their face. */
const showing = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => printedCardName(game.state.objects[id]) === name);

/** Alice's Graf Rats and Midnight Scavengers, melded at her beginning of combat. */
function meldHost(): { game: Game; a: ReturnType<typeof table>["a"]; host: ObjectId } {
  const t = table();
  spawn(t.game, "Graf Rats");
  spawn(t.game, "Midnight Scavengers");
  toStep(t.game, "begin-combat");
  settle(t.game);
  const [host] = showing(t.game, HOST);
  return { game: t.game, a: t.a, host };
}

describe("melding (rule 701.42)", () => {
  it("Graf Rats and Midnight Scavengers meld into one Chittering Host at the beginning of combat", () => {
    const { game, host } = meldHost();
    expect(showing(game, HOST)).toHaveLength(1);
    // One object: neither front face is on the battlefield any more, and the
    // other card isn't sitting in exile.
    expect(game.battlefield.filter((id) => ["Graf Rats", "Midnight Scavengers"].includes(printedCardName(game.state.objects[id])))).toEqual([]);
    expect(game.state.zones.shared.exile).toEqual([]);
    // Only the combined back face's characteristics (712.8g) …
    expect(pt(game, host)).toEqual({ power: 5, toughness: 6 });
    expect(keywords(game, host).has("haste")).toBe(true);
    expect(keywords(game, host).has("menace")).toBe(true);
    // … and its front faces' mana values summed: {4}{B} + {1}{B} (202.3c).
    expect(manaValueOfObject(registryOf(game), game.state.objects[host])).toBe(7);
    // It's shown as the combined face, its own name.
    expect(game.viewFor(A).objects[host]?.faceName).toBe(HOST);
  });

  it("is a new object that enters the battlefield: its enters ability fires", () => {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears");
    spawn(t.game, "Graf Rats");
    spawn(t.game, "Midnight Scavengers");
    toStep(t.game, "begin-combat");
    settle(t.game);
    const [host] = showing(t.game, HOST);
    expect(t.game.state.objects[host].summoningSick).toBe(true);
    // "Other creatures you control get +1/+0 and gain menace."
    expect(pt(t.game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(t.game, bears).has("menace")).toBe(true);
    expect(pt(t.game, host)).toEqual({ power: 5, toughness: 6 });
  });

  it("is its owner's commander when either card is (rule 903.3b)", () => {
    const { game } = table();
    const rats = spawn(game, "Graf Rats");
    game.state.objects[rats].isCommander = true;
    spawn(game, "Midnight Scavengers");
    toStep(game, "begin-combat");
    settle(game);
    const [host] = showing(game, HOST);
    expect(game.state.objects[host].isCommander).toBe(true);
  });

  it("doesn't trigger without both cards owned and controlled", () => {
    const { game } = table();
    const rats = spawn(game, "Graf Rats");
    // Bob's Midnight Scavengers isn't one Alice owns and controls.
    spawn(game, "Midnight Scavengers", B);
    toStep(game, "begin-combat");
    expect(game.state.zones.shared.stack).toEqual([]);
    settle(game);
    expect(zone(game, rats)).toBe("battlefield");
    expect(showing(game, HOST)).toEqual([]);
  });

  it("does nothing if the counterpart is gone by the time it resolves (rule 603.4)", () => {
    const { game } = table();
    const rats = spawn(game, "Graf Rats");
    const scavengers = spawn(game, "Midnight Scavengers");
    toStep(game, "begin-combat");
    expect(game.state.zones.shared.stack).toHaveLength(1);
    destroy(game, scavengers);
    settle(game);
    expect(zone(game, rats)).toBe("battlefield");
    expect(showing(game, HOST)).toEqual([]);
  });
});

describe("a melded permanent leaving the battlefield (rule 712.21)", () => {
  it("dies as one permanent and puts both cards into the graveyard", () => {
    const { game, host } = meldHost();
    destroy(game, host);
    expect(showing(game, HOST)).toEqual([]);
    const names = graveyard(game, A).map((id) => game.state.objects[id].cardName).sort();
    expect(names).toEqual(["Graf Rats", "Midnight Scavengers"]);
    // Each front face up again (712.8a).
    for (const id of graveyard(game, A)) expect(game.state.objects[id].melded).toBeUndefined();
  });

  it("returns to its owner's hand as two cards", () => {
    const { game, host } = meldHost();
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(host)]);
    settle(game);
    expect(hand(game, A).map((id) => game.state.objects[id].cardName).filter((n) => n !== "Wastes").sort()).toEqual(["Graf Rats", "Midnight Scavengers"]);
  });

  it("put on top of its owner's library, both cards go on top", () => {
    const { game, host } = meldHost();
    game.debugApplyEffect(B, { kind: "put-on-library", target: 0, position: "top" }, [ref(host)]);
    settle(game);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(0, 2).map((id) => game.state.objects[id].cardName).sort()).toEqual(["Graf Rats", "Midnight Scavengers"]);
  });

  it("blinked, both cards come back — as two permanents, front faces up (the meld ruling)", () => {
    const { game, host } = meldHost();
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(host)]);
    settle(game);
    expect(showing(game, HOST)).toEqual([]);
    expect(showing(game, "Graf Rats")).toHaveLength(1);
    expect(showing(game, "Midnight Scavengers")).toHaveLength(1);
    expect(game.state.zones.shared.exile).toEqual([]);
  });

  it("a copy of it has the combined face's characteristics and mana value 0 (rule 202.3c)", () => {
    const { game, host } = meldHost();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].copyOf = printedCardName(game.state.objects[host]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 6 });
    expect(manaValueOfObject(registryOf(game), game.state.objects[bears])).toBe(0);
  });
});

describe("an activated meld: Hanweir Battlements", () => {
  it("melds with Hanweir Garrison into Hanweir, the Writhing Township, which makes attacking Horrors", () => {
    const { game, a } = table();
    const battlements = spawn(game, "Hanweir Battlements");
    spawn(game, "Hanweir Garrison");
    lands(game, "Mountain", 5);
    activate(game, battlements, 2);
    const [township] = showing(game, TOWNSHIP);
    expect(township).toBeDefined();
    expect(pt(game, township)).toEqual({ power: 7, toughness: 4 });
    expect(keywords(game, township).has("haste")).toBe(true);
    expect(keywords(game, township).has("trample")).toBe(true);
    // {2}{R} + a land's nothing (202.3c).
    expect(manaValueOfObject(registryOf(game), game.state.objects[township])).toBe(3);
    // Haste: it attacks the turn it melds.
    a.declareAttackersFn = () => [{ attacker: township, defender: B }];
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(2);
    expect(game.state.players[B].life).toBe(20 - 7 - 3 - 3);
  });

  it("asks which Hanweir Garrison, when there are two (the ruling)", () => {
    const { game, a } = table();
    const battlements = spawn(game, "Hanweir Battlements");
    const first = spawn(game, "Hanweir Garrison");
    const second = spawn(game, "Hanweir Garrison");
    lands(game, "Mountain", 5);
    const seen = pickPermanents(a, second);
    activate(game, battlements, 2);
    expect([...seen.offered].sort()).toEqual([first, second].sort());
    expect(showing(game, TOWNSHIP)).toHaveLength(1);
    expect(zone(game, first)).toBe("battlefield");
  });

  it("a token named Hanweir Garrison can't be melded: both are exiled and stay there (rule 701.42c)", () => {
    const { game } = table();
    const battlements = spawn(game, "Hanweir Battlements");
    const garrison = spawn(game, "Hanweir Garrison");
    game.state.objects[garrison].isToken = true;
    lands(game, "Mountain", 5);
    activate(game, battlements, 2);
    expect(showing(game, TOWNSHIP)).toEqual([]);
    expect(zone(game, battlements)).toBe("exile");
    expect(game.state.objects[garrison]?.zone ?? "gone").not.toBe("battlefield");
  });

  it("does nothing if you no longer control the Garrison as it resolves", () => {
    const { game } = table();
    const battlements = spawn(game, "Hanweir Battlements");
    const garrison = spawn(game, "Hanweir Garrison");
    lands(game, "Mountain", 5);
    activate(game, battlements, 2, { settle: false });
    destroy(game, garrison);
    expect(zone(game, battlements)).toBe("battlefield");
    expect(showing(game, TOWNSHIP)).toEqual([]);
  });
});

describe("the combined back face", () => {
  it("is no card of its own: no decklist can list it", () => {
    expect(isCardFront(registryOf(table().game).get(HOST))).toBe(false);
    expect(isCardFront(registryOf(table().game).get("Graf Rats"))).toBe(true);
  });
});
